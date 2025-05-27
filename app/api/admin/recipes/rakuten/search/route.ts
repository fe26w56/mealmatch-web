import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    const isAdminResult = await isAdmin(request)
    if (!isAdminResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams: urlParams } = new URL(request.url)
    const keyword = urlParams.get('keyword')
    const testMode = urlParams.get('test') === 'true' // テストモードパラメータ

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    // 楽天レシピAPIのアプリケーションID（環境変数から取得）
    const applicationId = process.env.RAKUTEN_APPLICATION_ID

    // API接続テスト情報
    const apiTestInfo = {
      hasApiKey: !!applicationId,
      apiKeyLength: applicationId ? applicationId.length : 0,
      apiKeyPreview: applicationId ? `${applicationId.substring(0, 4)}...${applicationId.substring(applicationId.length - 4)}` : 'Not set',
      timestamp: new Date().toISOString(),
      keyword: keyword
    }

    console.log('🔍 Rakuten Recipe API Search:', apiTestInfo)

    if (!applicationId) {
      // APIキーがない場合はエラーを返す
      return NextResponse.json({ 
        recipes: [],
        message: '⚠️ Rakuten API key not configured',
        apiTest: {
          ...apiTestInfo,
          status: 'NO_API_KEY',
          recommendation: 'Set RAKUTEN_APPLICATION_ID environment variable to use real Rakuten Recipe API'
        }
      })
    }

    // 楽天レシピAPIを使用してレシピを取得
    const recipes = await fetchRakutenRecipes(applicationId, keyword, apiTestInfo)
    
    return NextResponse.json(recipes)

  } catch (error) {
    console.error('💥 Rakuten recipe search error:', error)
    // エラー時は空の結果を返す
    const { searchParams: errorUrlParams } = new URL(request.url)
    const errorKeyword = errorUrlParams.get('keyword') || 'レシピ'
    return NextResponse.json({ 
      recipes: [],
      message: '❌ Error occurred while searching recipes',
      apiTest: {
        hasApiKey: !!process.env.RAKUTEN_APPLICATION_ID,
        status: 'EXCEPTION',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        keyword: errorKeyword,
        recommendation: 'Check server logs for detailed error information'
      }
    })
  }
}

// 楽天レシピAPIからレシピを取得する関数
async function fetchRakutenRecipes(applicationId: string, keyword: string, apiTestInfo: any) {
  const allRecipes: any[] = []
  
  try {
    // まず楽天レシピカテゴリ一覧APIを呼び出して実際のカテゴリIDを取得
    console.log('🔍 Fetching category list from Rakuten Recipe API...')
    const categoryApiUrl = `https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426`
    const categoryParams = new URLSearchParams({
      applicationId,
      categoryType: 'large'
    })

    const categoryResponse = await fetch(`${categoryApiUrl}?${categoryParams}`)
    
    if (!categoryResponse.ok) {
      console.warn('⚠️ Category List API failed:', categoryResponse.status, categoryResponse.statusText)
      const errorText = await categoryResponse.text()
      console.warn('📄 Category API Error Response:', errorText)
      
      return {
        recipes: [],
        message: `❌ Category API failed for "${keyword}"`,
        apiTest: {
          ...apiTestInfo,
          status: 'CATEGORY_API_ERROR',
          httpStatus: categoryResponse.status,
          httpStatusText: categoryResponse.statusText,
          errorDetails: errorText,
          recommendation: 'Category List API failed. Check API key permissions for Recipe API access.'
        }
      }
    }

    const categoryData = await categoryResponse.json()
    console.log('✅ Category data received:', categoryData)
    
    // 実際のカテゴリIDを取得
    const availableCategories = categoryData.result?.large || []
    console.log('📋 Available large categories:', availableCategories.map((cat: any) => `${cat.categoryId}: ${cat.categoryName}`))
    
    if (availableCategories.length === 0) {
      console.warn('⚠️ No categories found in API response')
      return {
        recipes: [],
        message: `❌ No categories available for "${keyword}"`,
        apiTest: {
          ...apiTestInfo,
          status: 'NO_CATEGORIES',
          recommendation: 'No categories found in Rakuten Recipe API response.'
        }
      }
    }
    
    // キーワードに基づいて適切なカテゴリIDを選択（実際のカテゴリIDを使用）
    const selectedCategories = selectCategoriesFromAvailable(keyword, availableCategories)
    console.log(`🎯 Selected categories for "${keyword}":`, selectedCategories.map(cat => `${cat.categoryId}: ${cat.categoryName}`))
    
    // 各カテゴリからレシピを取得
    for (const category of selectedCategories) {
      try {
        const rakutenApiUrl = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426`
        const apiParams = new URLSearchParams({
          applicationId,
          categoryId: category.categoryId.toString()
        })

        const fullApiUrl = `${rakutenApiUrl}?${apiParams}`
        console.log(`🌐 Fetching from category ${category.categoryId} (${category.categoryName}):`, fullApiUrl.replace(applicationId, '***API_KEY***'))

        const response = await fetch(fullApiUrl)
        
        if (!response.ok) {
          console.warn(`⚠️ Category ${category.categoryId} failed:`, response.status, response.statusText)
          const errorText = await response.text()
          console.warn(`📄 Error details for category ${category.categoryId}:`, errorText)
          continue
        }

        const data = await response.json()
        console.log(`📊 Category ${category.categoryId} response:`, {
          hasResult: !!data.result,
          resultCount: Array.isArray(data.result) ? data.result.length : 0,
          resultType: typeof data.result
        })
        
        if (data.result && Array.isArray(data.result)) {
          // 楽天レシピAPIのレスポンスをフィルタリングして変換
          const categoryRecipes = data.result
            .filter((item: any) => {
              // キーワードに関連するレシピのみをフィルタリング
              const title = item.recipeTitle?.toLowerCase() || ''
              const description = item.recipeDescription?.toLowerCase() || ''
              const materials = Array.isArray(item.recipeMaterial) 
                ? item.recipeMaterial.join(' ').toLowerCase() 
                : ''
              
              const searchKeyword = keyword.toLowerCase()
              return title.includes(searchKeyword) || 
                     description.includes(searchKeyword) || 
                     materials.includes(searchKeyword)
            })
            .map((item: any) => ({
              recipeId: item.recipeId?.toString() || `rakuten_${Date.now()}_${Math.random()}`,
              recipeTitle: item.recipeTitle || '',
              recipeUrl: item.recipeUrl || '',
              foodImageUrl: item.foodImageUrl || '',
              recipeDescription: item.recipeDescription || '',
              recipeMaterial: Array.isArray(item.recipeMaterial) ? item.recipeMaterial : [],
              recipeIndication: item.recipeIndication || '',
              recipeInstructions: item.recipeInstructions || '', // 楽天APIから取得できる場合のみ
              categoryName: category.categoryName,
              nickname: item.nickname || '',
              recipePublishday: item.recipePublishday || '',
              shop: item.shop || 0,
              pickup: item.pickup || 0,
              rank: item.rank?.toString() || ''
            }))
          
          allRecipes.push(...categoryRecipes)
          console.log(`✅ Category ${category.categoryId}: Found ${categoryRecipes.length} matching recipes`)
        }
        
        // APIレート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 500))
        
      } catch (error) {
        console.error(`❌ Error fetching category ${category.categoryId}:`, error)
        continue
      }
    }
    
    // レシピが見つからない場合は空の結果を返す
    if (allRecipes.length === 0) {
      console.log('📝 No recipes found from API')
      
      return {
        recipes: [],
        message: `❌ No recipes found for "${keyword}" in Rakuten Recipe API`,
        apiTest: {
          ...apiTestInfo,
          status: 'NO_MATCHES',
          categoriesSearched: selectedCategories.map(cat => `${cat.categoryId}: ${cat.categoryName}`),
          availableCategories: availableCategories.map((cat: any) => `${cat.categoryId}: ${cat.categoryName}`),
          recommendation: 'Try different keywords or check if the recipes exist in Rakuten Recipe database'
        }
      }
    }
    
    return {
      recipes: allRecipes.slice(0, 20), // 最大20件に制限
      message: `✅ Found ${allRecipes.length} recipes for "${keyword}" from Rakuten Recipe API`,
      apiTest: {
        ...apiTestInfo,
        status: 'SUCCESS',
        categoriesSearched: selectedCategories.map(cat => `${cat.categoryId}: ${cat.categoryName}`),
        availableCategories: availableCategories.map((cat: any) => `${cat.categoryId}: ${cat.categoryName}`),
        totalFound: allRecipes.length
      }
    }
    
  } catch (error) {
    console.error('💥 Error in fetchRakutenRecipes:', error)
    return {
      recipes: [],
      message: `❌ Error occurred while fetching recipes for "${keyword}"`,
      apiTest: {
        ...apiTestInfo,
        status: 'EXCEPTION',
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendation: 'Check server logs for detailed error information'
      }
    }
  }
}

// 利用可能なカテゴリからキーワードに適したものを選択
function selectCategoriesFromAvailable(keyword: string, availableCategories: any[]): any[] {
  const keywordLower = keyword.toLowerCase()
  
  // キーワードに基づいてカテゴリ名で検索
  const matchingCategories = availableCategories.filter(category => {
    const categoryName = category.categoryName?.toLowerCase() || ''
    
    if (keywordLower.includes('肉') || keywordLower.includes('牛') || keywordLower.includes('豚') || keywordLower.includes('鶏')) {
      return categoryName.includes('肉') || categoryName.includes('お肉')
    } else if (keywordLower.includes('魚') || keywordLower.includes('サーモン') || keywordLower.includes('マグロ')) {
      return categoryName.includes('魚') || categoryName.includes('魚介')
    } else if (keywordLower.includes('野菜') || keywordLower.includes('キャベツ') || keywordLower.includes('人参')) {
      return categoryName.includes('野菜')
    } else if (keywordLower.includes('サラダ')) {
      return categoryName.includes('サラダ')
    } else if (keywordLower.includes('スープ') || keywordLower.includes('汁物')) {
      return categoryName.includes('スープ') || categoryName.includes('汁')
    } else if (keywordLower.includes('パスタ') || keywordLower.includes('グラタン')) {
      return categoryName.includes('パスタ') || categoryName.includes('グラタン')
    } else if (keywordLower.includes('ご飯') || keywordLower.includes('丼') || keywordLower.includes('米')) {
      return categoryName.includes('ご飯') || categoryName.includes('丼')
    } else if (keywordLower.includes('デザート') || keywordLower.includes('スイーツ') || keywordLower.includes('ケーキ')) {
      return categoryName.includes('お菓子') || categoryName.includes('デザート') || categoryName.includes('スイーツ')
    }
    
    return false
  })
  
  // マッチするカテゴリがない場合は、人気そうなカテゴリを選択
  if (matchingCategories.length === 0) {
    console.log('🔄 No matching categories found, selecting popular categories')
    return availableCategories.slice(0, 3) // 最初の3つのカテゴリを選択
  }
  
  return matchingCategories.slice(0, 3) // 最大3つのカテゴリを選択
} 