import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 管理者権限チェック
    const isAdminResult = await isAdmin(request)
    if (!isAdminResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { limit = 50 } = await request.json()

    // 楽天レシピAPIのアプリケーションID
    const applicationId = process.env.RAKUTEN_APPLICATION_ID

    if (!applicationId) {
      // APIキーがない場合は人気のモックレシピを使用
      console.log('⚠️ No Rakuten API key, using mock popular recipes')
      const mockRecipes = generatePopularMockRecipes(limit)
      const importResult = await importRecipesToDatabase(mockRecipes)
      
      return NextResponse.json({
        success: true,
        message: `Auto-imported ${importResult.imported} mock popular recipes (API key not configured)`,
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: [...importResult.errors],
        source: 'mock_data_no_api_key'
      })
    }

    console.log('🚀 Starting auto-import of popular recipes...')
    
    // 人気レシピを取得してインポート
    const result = await autoImportPopularRecipes(applicationId, limit)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Auto-import error:', error)
    return NextResponse.json({
      success: false,
      message: 'Auto-import failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      imported: 0,
      skipped: 0,
      errors: []
    }, { status: 500 })
  }
}

// 人気レシピを自動インポートする関数
async function autoImportPopularRecipes(applicationId: string, limit: number) {
  const importedRecipes: any[] = []
  const skippedRecipes: any[] = []
  const errors: string[] = []
  
  try {
    // まず楽天レシピカテゴリ一覧APIを呼び出して利用可能なカテゴリを取得
    console.log('🔍 Fetching available categories...')
    const categoryApiUrl = `https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426`
    const categoryParams = new URLSearchParams({
      applicationId,
      categoryType: 'large'
    })

    const categoryResponse = await fetch(`${categoryApiUrl}?${categoryParams}`)
    
    if (!categoryResponse.ok) {
      const errorText = await categoryResponse.text()
      console.error('❌ Category API failed:', categoryResponse.status, errorText)
      errors.push(`Category API failed: ${categoryResponse.status} ${errorText}`)
      
      // カテゴリ取得に失敗した場合は人気のモックレシピを生成
      const mockRecipes = generatePopularMockRecipes(limit)
      const importResult = await importRecipesToDatabase(mockRecipes)
      
      return {
        success: true,
        message: `Auto-imported ${importResult.imported} mock popular recipes (API unavailable)`,
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: [...errors, ...importResult.errors],
        source: 'mock_data'
      }
    }

    const categoryData = await categoryResponse.json()
    const availableCategories = categoryData.result?.large || []
    
    if (availableCategories.length === 0) {
      errors.push('No categories available from API')
      const mockRecipes = generatePopularMockRecipes(limit)
      const importResult = await importRecipesToDatabase(mockRecipes)
      
      return {
        success: true,
        message: `Auto-imported ${importResult.imported} mock popular recipes (no categories)`,
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: [...errors, ...importResult.errors],
        source: 'mock_data'
      }
    }

    console.log(`📋 Found ${availableCategories.length} categories`)
    
    // 各カテゴリから人気レシピを取得
    const allRecipes: any[] = []
    const recipesPerCategory = Math.ceil(limit / Math.min(availableCategories.length, 5)) // 最大5カテゴリから取得
    
    for (let i = 0; i < Math.min(availableCategories.length, 5); i++) {
      const category = availableCategories[i]
      
      try {
        console.log(`🌐 Fetching popular recipes from category: ${category.categoryName}`)
        
        const rakutenApiUrl = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426`
        const apiParams = new URLSearchParams({
          applicationId,
          categoryId: category.categoryId.toString()
        })

        const response = await fetch(`${rakutenApiUrl}?${apiParams}`)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.warn(`⚠️ Category ${category.categoryName} failed:`, response.status, errorText)
          errors.push(`Category ${category.categoryName} failed: ${response.status}`)
          continue
        }

        const data = await response.json()
        
        if (data.result && Array.isArray(data.result)) {
          const categoryRecipes = data.result
            .slice(0, recipesPerCategory) // 各カテゴリから指定数のレシピを取得
            .map((item: any) => ({
              recipeId: item.recipeId?.toString() || `auto_${Date.now()}_${Math.random()}`,
              recipeTitle: item.recipeTitle || '人気レシピ',
              recipeUrl: item.recipeUrl || '#',
              foodImageUrl: item.foodImageUrl || `https://picsum.photos/300/200?random=${Math.random()}`,
              recipeDescription: item.recipeDescription || '楽天レシピの人気レシピです',
              recipeMaterial: Array.isArray(item.recipeMaterial) ? item.recipeMaterial : ['材料情報なし'],
              recipeIndication: item.recipeIndication || '調理時間不明',
              recipeInstructions: item.recipeInstructions || generateRecipeInstructions(item.recipeTitle || '人気レシピ'),
              categoryName: category.categoryName,
              nickname: item.nickname || 'レシピ投稿者',
              recipePublishday: item.recipePublishday || new Date().toISOString().split('T')[0],
              shop: item.shop || 0,
              pickup: item.pickup || 0,
              rank: item.rank?.toString() || '1'
            }))
          
          allRecipes.push(...categoryRecipes)
          console.log(`✅ Got ${categoryRecipes.length} recipes from ${category.categoryName}`)
        }
        
        // APIレート制限を避けるため待機
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`❌ Error fetching from category ${category.categoryName}:`, error)
        errors.push(`Error in category ${category.categoryName}: ${error}`)
        continue
      }
    }
    
    // レシピが取得できなかった場合はモックデータを使用
    if (allRecipes.length === 0) {
      console.log('📝 No recipes from API, using mock data')
      const mockRecipes = generatePopularMockRecipes(limit)
      const importResult = await importRecipesToDatabase(mockRecipes)
      
      return {
        success: true,
        message: `Auto-imported ${importResult.imported} mock popular recipes (API returned no data)`,
        imported: importResult.imported,
        skipped: importResult.skipped,
        errors: [...errors, ...importResult.errors],
        source: 'mock_data'
      }
    }
    
    // データベースにインポート
    console.log(`💾 Importing ${allRecipes.length} recipes to database...`)
    const importResult = await importRecipesToDatabase(allRecipes.slice(0, limit))
    
    return {
      success: true,
      message: `Auto-imported ${importResult.imported} popular recipes from Rakuten Recipe API`,
      imported: importResult.imported,
      skipped: importResult.skipped,
      errors: [...errors, ...importResult.errors],
      source: 'rakuten_api',
      categories: availableCategories.slice(0, 5).map((cat: any) => cat.categoryName)
    }
    
  } catch (error) {
    console.error('💥 Error in autoImportPopularRecipes:', error)
    errors.push(`System error: ${error}`)
    
    // エラー時もモックデータでフォールバック
    const mockRecipes = generatePopularMockRecipes(limit)
    const importResult = await importRecipesToDatabase(mockRecipes)
    
    return {
      success: true,
      message: `Auto-imported ${importResult.imported} mock popular recipes (system error)`,
      imported: importResult.imported,
      skipped: importResult.skipped,
      errors: [...errors, ...importResult.errors],
      source: 'mock_data_fallback'
    }
  }
}

// レシピをデータベースにインポートする関数
async function importRecipesToDatabase(recipes: any[]) {
  const imported: string[] = []
  const skipped: string[] = []
  const errors: string[] = []
  
  // システム用の管理者ユーザーを取得（存在しない場合は最初の管理者ユーザーを使用）
  let systemUser = await prisma.user.findFirst({
    where: {
      email: 'admin@maalmatch.com'
    }
  })
  
  if (!systemUser) {
    // 管理者ユーザーが見つからない場合は、最初の管理者ユーザーを使用
    systemUser = await prisma.user.findFirst({
      where: {
        role: 'admin'
      }
    })
  }
  
  if (!systemUser) {
    errors.push('No admin user found for system import')
    return {
      imported: 0,
      skipped: 0,
      errors
    }
  }
  
  for (const recipe of recipes) {
    try {
      // 既存のレシピをチェック（タイトルで重複チェック）
      const existingRecipe = await prisma.savedRecipe.findFirst({
        where: {
          recipeTitle: recipe.recipeTitle
        }
      })
      
      if (existingRecipe) {
        skipped.push(recipe.recipeTitle)
        continue
      }
      
      // レシピをデータベースに保存
      await prisma.savedRecipe.create({
        data: {
          recipeId: recipe.recipeId,
          recipeTitle: recipe.recipeTitle,
          recipeUrl: recipe.recipeUrl,
          foodImageUrl: recipe.foodImageUrl,
          recipeDescription: recipe.recipeDescription,
          recipeMaterial: JSON.stringify(recipe.recipeMaterial),
          recipeIndication: recipe.recipeIndication,
          recipeInstructions: recipe.recipeInstructions,
          shopName: recipe.nickname,
          userId: systemUser.id, // 管理者ユーザーIDを使用
          liked: true
        }
      })
      
      imported.push(recipe.recipeTitle)
      console.log(`✅ Imported: ${recipe.recipeTitle}`)
      
    } catch (error) {
      console.error(`❌ Failed to import ${recipe.recipeTitle}:`, error)
      errors.push(`Failed to import ${recipe.recipeTitle}: ${error}`)
    }
  }
  
  return {
    imported: imported.length,
    skipped: skipped.length,
    errors
  }
}

// 人気のモックレシピを生成する関数
function generatePopularMockRecipes(limit: number): any[] {
  const popularRecipes = [
    {
      recipeTitle: '鶏の唐揚げ',
      recipeDescription: 'サクサクジューシーな定番唐揚げ。家族みんなが大好きな人気レシピです。',
      foodImageUrl: 'https://picsum.photos/300/200?random=karaage',
      recipeIndication: '30分',
      recipeMaterial: ['鶏もも肉 500g', '醤油 大さじ3', '酒 大さじ2', '生姜 1片', 'にんにく 1片', '片栗粉 適量', '揚げ油 適量'],
      recipeInstructions: '1. 鶏もも肉を一口大に切る\n2. 醤油、酒、すりおろした生姜とにんにくを混ぜて鶏肉を30分漬け込む\n3. 片栗粉をまぶして170℃の油で5分揚げる\n4. 一度取り出して3分休ませる\n5. 180℃の油で2分二度揚げして完成',
      categoryName: 'お肉のおかず'
    },
    {
      recipeTitle: 'ハンバーグ',
      recipeDescription: 'ふわふわジューシーなハンバーグ。デミグラスソースとの相性抜群です。',
      foodImageUrl: 'https://picsum.photos/300/200?random=hamburg',
      recipeIndication: '45分',
      recipeMaterial: ['合いびき肉 400g', '玉ねぎ 1個', 'パン粉 1/2カップ', '卵 1個', '牛乳 大さじ2', '塩胡椒 少々'],
      recipeInstructions: '1. 玉ねぎをみじん切りにして炒めて冷ます\n2. パン粉を牛乳に浸しておく\n3. ひき肉、玉ねぎ、パン粉、卵、塩胡椒を混ぜてこねる\n4. 4等分して楕円形に成形する\n5. フライパンで両面を焼き、蓋をして中火で10分蒸し焼きにする',
      categoryName: 'お肉のおかず'
    },
    {
      recipeTitle: '親子丼',
      recipeDescription: 'とろとろ卵と鶏肉の絶妙なハーモニー。簡単で美味しい丼ものです。',
      foodImageUrl: 'https://picsum.photos/300/200?random=oyakodon',
      recipeIndication: '20分',
      recipeMaterial: ['鶏もも肉 200g', '卵 3個', '玉ねぎ 1/2個', 'ご飯 2杯分', 'だし汁 200ml', '醤油 大さじ2', 'みりん 大さじ2'],
      recipeInstructions: '1. 鶏肉を一口大に切り、玉ねぎをスライスする\n2. だし汁、醤油、みりんを煮立てる\n3. 鶏肉と玉ねぎを加えて5分煮る\n4. 溶き卵を回し入れて半熟状態で火を止める\n5. 温かいご飯の上にのせて完成',
      categoryName: 'ご飯もの'
    },
    {
      recipeTitle: 'カレーライス',
      recipeDescription: '野菜たっぷりの本格カレー。スパイスの香りが食欲をそそります。',
      foodImageUrl: 'https://picsum.photos/300/200?random=curry',
      recipeIndication: '60分',
      recipeMaterial: ['牛肉 300g', 'じゃがいも 3個', '人参 1本', '玉ねぎ 2個', 'カレールー 1箱', 'ご飯 4杯分'],
      recipeInstructions: '1. 野菜を一口大に切る\n2. 牛肉を炒めて取り出す\n3. 玉ねぎを炒めて透明になったら人参、じゃがいもを加える\n4. 水と牛肉を加えて20分煮込む\n5. カレールーを加えて10分煮込んで完成',
      categoryName: 'ご飯もの'
    },
    {
      recipeTitle: '野菜炒め',
      recipeDescription: 'シャキシャキ野菜の栄養満点炒め物。彩り豊かで食卓が華やかになります。',
      foodImageUrl: 'https://picsum.photos/300/200?random=yasai',
      recipeIndication: '15分',
      recipeMaterial: ['キャベツ 1/4個', '人参 1/2本', 'ピーマン 2個', 'もやし 1袋', '豚肉 100g', '醤油 大さじ1', '塩胡椒 少々'],
      recipeInstructions: '1. 野菜を食べやすい大きさに切る\n2. フライパンに油を熱し、豚肉を炒める\n3. 硬い野菜から順に加えて炒める\n4. 醤油と塩胡椒で味付けして完成',
      categoryName: '野菜のおかず'
    },
    {
      recipeTitle: 'サーモンのムニエル',
      recipeDescription: 'バターの香りが食欲をそそるサーモンのムニエル。レモンを絞って召し上がれ。',
      foodImageUrl: 'https://picsum.photos/300/200?random=salmon',
      recipeIndication: '20分',
      recipeMaterial: ['サーモン 2切れ', 'バター 20g', '小麦粉 適量', 'レモン 1/2個', '塩胡椒 少々', 'パセリ 適量'],
      recipeInstructions: '1. サーモンに塩胡椒をして10分置く\n2. 小麦粉を薄くまぶす\n3. フライパンにバターを熱し、サーモンを皮目から焼く\n4. 両面をこんがり焼いて火を通す\n5. レモンとパセリを添えて完成',
      categoryName: '魚介のおかず'
    },
    {
      recipeTitle: 'ミートソースパスタ',
      recipeDescription: '濃厚なミートソースが絡む本格パスタ。チーズをかけて更に美味しく。',
      foodImageUrl: 'https://picsum.photos/300/200?random=pasta',
      recipeIndication: '40分',
      recipeMaterial: ['パスタ 200g', '合いびき肉 200g', 'トマト缶 1缶', '玉ねぎ 1個', 'にんにく 2片', 'オリーブオイル 大さじ2'],
      recipeInstructions: '1. 玉ねぎとにんにくをみじん切りにする\n2. オリーブオイルでにんにくを炒め、玉ねぎを加える\n3. ひき肉を加えて炒め、トマト缶を加えて20分煮込む\n4. パスタを茹でて、ソースと絡めて完成',
      categoryName: 'パスタ・グラタン'
    },
    {
      recipeTitle: 'シーザーサラダ',
      recipeDescription: 'クリーミーなドレッシングとクルトンが美味しいシーザーサラダ。',
      foodImageUrl: 'https://picsum.photos/300/200?random=salad',
      recipeIndication: '15分',
      recipeMaterial: ['レタス 1個', 'トマト 1個', 'パルメザンチーズ 適量', 'クルトン 適量', 'シーザードレッシング 適量'],
      recipeInstructions: '1. レタスを一口大にちぎって冷水にさらす\n2. トマトをくし切りにする\n3. レタスの水気を切って皿に盛る\n4. トマト、クルトン、チーズをのせる\n5. ドレッシングをかけて完成',
      categoryName: 'サラダ'
    }
  ]
  
  // 指定された数まで繰り返し
  const result: any[] = []
  for (let i = 0; i < limit; i++) {
    const recipe = popularRecipes[i % popularRecipes.length]
    result.push({
      ...recipe,
      recipeId: `mock_popular_${Date.now()}_${i}`,
      recipeUrl: '#',
      nickname: 'レシピマスター',
      recipePublishday: new Date().toISOString().split('T')[0],
      shop: 0,
      pickup: 1, // 人気レシピなのでピックアップ扱い
      rank: ((i % 4) + 1).toString() // 1-4位のランキング
    })
  }
  
  return result
}

// レシピの作り方を生成する関数
function generateRecipeInstructions(recipeTitle: string): string {
  const title = recipeTitle.toLowerCase()
  
  if (title.includes('唐揚げ') || title.includes('から揚げ')) {
    return '1. 鶏肉を一口大に切る\n2. 下味をつけて30分漬け込む\n3. 片栗粉をまぶして揚げる\n4. 二度揚げしてカリッと仕上げる'
  } else if (title.includes('ハンバーグ')) {
    return '1. 玉ねぎをみじん切りにして炒める\n2. ひき肉と調味料を混ぜてこねる\n3. 成形してフライパンで焼く\n4. 蓋をして蒸し焼きにする'
  } else if (title.includes('カレー')) {
    return '1. 野菜と肉を切る\n2. 肉を炒めて取り出す\n3. 野菜を炒めて水を加えて煮る\n4. カレールーを加えて煮込む'
  } else if (title.includes('炒め')) {
    return '1. 材料を食べやすい大きさに切る\n2. 油を熱したフライパンで炒める\n3. 調味料で味付けする\n4. 火が通ったら完成'
  } else if (title.includes('サラダ')) {
    return '1. 野菜を洗って水気を切る\n2. 食べやすい大きさに切る\n3. 皿に盛り付ける\n4. ドレッシングをかけて完成'
  } else {
    return '1. 材料を準備する\n2. 下処理をする\n3. 調理する\n4. 味付けして完成'
  }
} 