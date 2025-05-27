import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'

interface TestResult {
  testName: string
  success: boolean
  httpStatus?: number
  httpStatusText?: string
  responseTime: number
  error?: string
  url: string
  [key: string]: any // 追加のプロパティを許可
}

export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    const isAdminResult = await isAdmin(request)
    if (!isAdminResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const applicationId = process.env.RAKUTEN_APPLICATION_ID
    
    // APIキーの詳細分析
    const apiKeyAnalysis = analyzeApiKey(applicationId)
    
    const testResults = {
      timestamp: new Date().toISOString(),
      apiKey: {
        exists: !!applicationId,
        length: applicationId ? applicationId.length : 0,
        preview: applicationId ? `${applicationId.substring(0, 8)}...${applicationId.substring(applicationId.length - 8)}` : 'Not set',
        rawValue: applicationId ? `${applicationId.substring(0, 12)}...` : 'Not set', // デバッグ用
        analysis: apiKeyAnalysis
      },
      tests: [] as TestResult[]
    }

    if (!applicationId) {
      return NextResponse.json({
        ...testResults,
        status: 'NO_API_KEY',
        message: 'Rakuten API key not configured',
        recommendation: 'Set RAKUTEN_APPLICATION_ID in .env.local'
      })
    }

    console.log('🧪 Starting Rakuten Recipe API connection tests...')
    console.log(`🔑 API Key analysis:`, apiKeyAnalysis)
    
    // テスト-1: 楽天ウェブサービス全体の状態確認
    console.log('🔍 Test -1: Rakuten Web Service Status Check')
    const serviceStatusTest = await testRakutenServiceStatus()
    testResults.tests.push(serviceStatusTest)
    
    // テスト0: 楽天市場APIで基本的なAPIキー検証
    console.log('🔍 Test 0: Basic API Key Validation (Rakuten Ichiba)')
    const basicTest = await testBasicApiKey(applicationId)
    testResults.tests.push(basicTest)
    
    // テスト1: カテゴリ一覧API（複数のパラメータパターンを試行）
    console.log('🔍 Test 1: Category List API')
    const categoryTest = await testCategoryListAPI(applicationId)
    testResults.tests.push(categoryTest)
    
    // テスト1.5: 別のパラメータでカテゴリ一覧API
    if (!categoryTest.success) {
      console.log('🔍 Test 1.5: Category List API (alternative parameters)')
      const categoryTestAlt = await testCategoryListAPIAlternative(applicationId)
      testResults.tests.push(categoryTestAlt)
    }
    
    // テスト2: カテゴリランキングAPI（最初のカテゴリを使用）
    if (categoryTest.success && categoryTest.categories && categoryTest.categories.length > 0) {
      console.log('🔍 Test 2: Category Ranking API')
      const rankingTest = await testCategoryRankingAPI(applicationId, categoryTest.categories[0].categoryId)
      testResults.tests.push(rankingTest)
    }
    
    // 全体的な結果判定
    const allTestsPassed = testResults.tests.every(test => test.success)
    const overallStatus = allTestsPassed ? 'SUCCESS' : 'PARTIAL_FAILURE'
    
    return NextResponse.json({
      ...testResults,
      status: overallStatus,
      message: allTestsPassed ? 'All API tests passed' : 'Some API tests failed',
      summary: {
        totalTests: testResults.tests.length,
        passed: testResults.tests.filter(test => test.success).length,
        failed: testResults.tests.filter(test => !test.success).length
      }
    })

  } catch (error) {
    console.error('💥 API test error:', error)
    return NextResponse.json({
      status: 'ERROR',
      message: 'API test failed with exception',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// APIキーの詳細分析関数
function analyzeApiKey(apiKey: string | undefined) {
  if (!apiKey) {
    return {
      status: 'MISSING',
      issues: ['APIキーが設定されていません']
    }
  }

  const issues: string[] = []
  const warnings: string[] = []

  // 長さチェック
  if (apiKey.length !== 40) {
    issues.push(`APIキーの長さが異常です (${apiKey.length}文字、期待値: 40文字)`)
  }

  // 文字種チェック
  const validChars = /^[a-f0-9]+$/i
  if (!validChars.test(apiKey)) {
    issues.push('APIキーに無効な文字が含まれています (英数字のみ有効)')
  }

  // 空白文字チェック
  if (apiKey !== apiKey.trim()) {
    issues.push('APIキーの前後に空白文字があります')
  }

  // 改行文字チェック
  if (apiKey.includes('\n') || apiKey.includes('\r')) {
    issues.push('APIキーに改行文字が含まれています')
  }

  // 特殊文字チェック
  const specialChars = /[^a-zA-Z0-9]/g
  const foundSpecialChars = apiKey.match(specialChars)
  if (foundSpecialChars) {
    issues.push(`特殊文字が含まれています: ${foundSpecialChars.join(', ')}`)
  }

  // 文字コードチェック
  const charCodes = []
  for (let i = 0; i < Math.min(apiKey.length, 10); i++) {
    charCodes.push(apiKey.charCodeAt(i))
  }

  return {
    status: issues.length === 0 ? 'VALID' : 'INVALID',
    issues,
    warnings,
    details: {
      length: apiKey.length,
      trimmed: apiKey.trim(),
      firstChars: apiKey.substring(0, 8),
      lastChars: apiKey.substring(apiKey.length - 8),
      charCodes: charCodes,
      hasSpecialChars: !!foundSpecialChars,
      isHex: /^[a-f0-9]+$/i.test(apiKey)
    }
  }
}

// 楽天ウェブサービス全体の状態確認
async function testRakutenServiceStatus(): Promise<TestResult> {
  const testName = 'Rakuten Web Service Status'
  const startTime = Date.now()
  
  try {
    // 楽天ウェブサービスのステータスページを確認
    const statusUrl = 'https://webservice.rakuten.co.jp/'
    
    console.log(`🌐 Checking Rakuten Web Service status: ${statusUrl}`)
    
    const response = await fetch(statusUrl, {
      method: 'HEAD', // HEADリクエストでサーバーの生存確認
      headers: {
        'User-Agent': 'MaalMatch-Recipe-App/1.0'
      }
    })
    const responseTime = Date.now() - startTime
    
    console.log(`📊 Service status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      return {
        testName,
        success: false,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseTime,
        error: `楽天ウェブサービスが利用できません (${response.status})`,
        url: statusUrl,
        note: '楽天ウェブサービス全体の状態確認',
        recommendation: '楽天ウェブサービスがメンテナンス中または障害が発生している可能性があります。'
      }
    }
    
    return {
      testName,
      success: true,
      httpStatus: response.status,
      responseTime,
      url: statusUrl,
      note: '楽天ウェブサービスは正常に稼働しています'
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`💥 ${testName} exception:`, error)
    
    return {
      testName,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: 'https://webservice.rakuten.co.jp/',
      note: '楽天ウェブサービスへの接続に失敗',
      recommendation: 'インターネット接続を確認してください。'
    }
  }
}

// 基本的なAPIキー検証（楽天市場API使用）
async function testBasicApiKey(applicationId: string): Promise<TestResult> {
  const testName = 'Basic API Key Validation'
  const startTime = Date.now()
  
  try {
    // 楽天市場APIのジャンル検索を使用（最もシンプルなAPI）
    const apiUrl = `https://app.rakuten.co.jp/services/api/IchibaGenre/Search/20140222`
    const params = new URLSearchParams({
      applicationId,
      genreId: '0', // ルートジャンル
      format: 'json'
    })
    
    const fullUrl = `${apiUrl}?${params}`
    console.log(`🌐 Testing basic API key: ${fullUrl.replace(applicationId, '***API_KEY***')}`)
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'MaalMatch-Recipe-App/1.0',
        'Accept': 'application/json'
      }
    })
    const responseTime = Date.now() - startTime
    
    console.log(`📊 Basic API test status: ${response.status} ${response.statusText}`)
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ ${testName} failed:`, response.status, errorText)
      
      // 詳細なエラー解析
      let errorAnalysis = 'Unknown error'
      let recommendation = ''
      let debugInfo: any = {}
      
      try {
        const errorJson = JSON.parse(errorText)
        errorAnalysis = `${errorJson.error}: ${errorJson.error_description}`
        debugInfo = errorJson
        
        if (errorJson.error === 'wrong_parameter' && errorJson.error_description.includes('applicationId')) {
          recommendation = '🔧 APIキーが楽天ウェブサービスで認識されていません。以下を確認してください:\n' +
                          '1. 楽天ウェブサービス (https://webservice.rakuten.co.jp/) にログイン\n' +
                          '2. アプリケーション管理でAPIキーの状態を確認\n' +
                          '3. APIキーが有効化されているか確認\n' +
                          '4. 利用可能なAPIサービスに「楽天レシピ」が含まれているか確認'
        } else if (response.status === 401) {
          recommendation = 'APIキーの認証に失敗しました。アプリケーションIDが正しく設定されているか確認してください。'
        } else if (response.status === 403) {
          recommendation = 'APIアクセスが拒否されました。アプリケーションの権限設定を確認してください。'
        }
      } catch {
        errorAnalysis = errorText
        if (response.status === 400) {
          recommendation = 'リクエストパラメータに問題があります。APIキーの形式を確認してください。'
        }
      }
      
      return {
        testName,
        success: false,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseTime,
        error: errorAnalysis,
        url: apiUrl,
        note: 'APIキーの基本検証に失敗',
        recommendation,
        debugInfo,
        requestDetails: {
          url: fullUrl.replace(applicationId, '***API_KEY***'),
          method: 'GET',
          headers: {
            'User-Agent': 'MaalMatch-Recipe-App/1.0',
            'Accept': 'application/json'
          }
        }
      }
    }
    
    const data = await response.json()
    console.log(`✅ ${testName} success: API key is valid`)
    console.log(`📊 API response structure:`, Object.keys(data))
    
    return {
      testName,
      success: true,
      httpStatus: response.status,
      responseTime,
      url: apiUrl,
      note: 'APIキーは有効です（楽天市場APIで検証済み）',
      apiKeyStatus: 'VALID',
      responseStructure: Object.keys(data)
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`💥 ${testName} exception:`, error)
    
    let recommendation = 'ネットワーク接続を確認してください。'
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        recommendation = 'APIサーバーへの接続に失敗しました。ネットワーク設定を確認してください。'
      }
    }
    
    return {
      testName,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: 'https://app.rakuten.co.jp/services/api/IchibaGenre/Search/20140222',
      note: 'ネットワークエラーまたはAPIキー形式エラー',
      recommendation
    }
  }
}

// カテゴリ一覧API（代替パラメータ）
async function testCategoryListAPIAlternative(applicationId: string): Promise<TestResult> {
  const testName = 'Category List API (Alternative)'
  const startTime = Date.now()
  
  try {
    // 異なるcategoryTypeを試行
    const apiUrl = `https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426`
    const params = new URLSearchParams({
      applicationId,
      categoryType: 'medium' // largeの代わりにmediumを試行
    })
    
    const fullUrl = `${apiUrl}?${params}`
    console.log(`🌐 Testing alternative: ${fullUrl.replace(applicationId, '***API_KEY***')}`)
    
    const response = await fetch(fullUrl)
    const responseTime = Date.now() - startTime
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ ${testName} failed:`, response.status, errorText)
      
      // さらに別のパラメータを試行
      const params2 = new URLSearchParams({
        applicationId,
        categoryType: 'small'
      })
      
      const fullUrl2 = `${apiUrl}?${params2}`
      console.log(`🌐 Testing small category: ${fullUrl2.replace(applicationId, '***API_KEY***')}`)
      
      const response2 = await fetch(fullUrl2)
      const responseTime2 = Date.now() - startTime
      
      if (!response2.ok) {
        const errorText2 = await response2.text()
        return {
          testName,
          success: false,
          httpStatus: response2.status,
          httpStatusText: response2.statusText,
          responseTime: responseTime2,
          error: `Medium: ${errorText}, Small: ${errorText2}`,
          url: apiUrl,
          note: 'すべてのcategoryTypeで失敗'
        }
      }
      
      const data2 = await response2.json()
      const categories2 = data2.result?.small || []
      
      return {
        testName,
        success: true,
        httpStatus: response2.status,
        responseTime: responseTime2,
        categories: categories2.slice(0, 5).map((cat: any) => ({
          categoryId: cat.categoryId,
          categoryName: cat.categoryName
        })),
        totalCategories: categories2.length,
        url: apiUrl,
        note: 'smallカテゴリで成功'
      }
    }
    
    const data = await response.json()
    const categories = data.result?.medium || []
    
    console.log(`✅ ${testName} success: Found ${categories.length} medium categories`)
    
    return {
      testName,
      success: true,
      httpStatus: response.status,
      responseTime,
      categories: categories.slice(0, 5).map((cat: any) => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName
      })),
      totalCategories: categories.length,
      url: apiUrl,
      note: 'mediumカテゴリで成功'
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`💥 ${testName} exception:`, error)
    
    return {
      testName,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: 'https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426',
      note: '代替パラメータテストでエラー'
    }
  }
}

// カテゴリ一覧APIのテスト
async function testCategoryListAPI(applicationId: string): Promise<TestResult> {
  const testName = 'Category List API'
  const startTime = Date.now()
  
  try {
    const apiUrl = `https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426`
    
    // 楽天レシピAPIの正しいパラメータ設定
    const params = new URLSearchParams({
      applicationId,
      format: 'json'
      // categoryTypeは省略（省略時は全て取得）
    })
    
    const fullUrl = `${apiUrl}?${params}`
    console.log(`🌐 Testing: ${fullUrl.replace(applicationId, '***API_KEY***')}`)
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'MaalMatch-Recipe-App/1.0',
        'Accept': 'application/json'
      }
    })
    const responseTime = Date.now() - startTime
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`)
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ ${testName} failed:`, response.status, errorText)
      
      // 詳細なエラー解析
      let errorAnalysis = 'Unknown error'
      try {
        const errorJson = JSON.parse(errorText)
        errorAnalysis = `${errorJson.error}: ${errorJson.error_description}`
      } catch {
        errorAnalysis = errorText
      }
      
      return {
        testName,
        success: false,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseTime,
        error: errorAnalysis,
        url: apiUrl,
        requestUrl: fullUrl.replace(applicationId, '***API_KEY***'),
        note: 'レシピカテゴリ一覧APIの基本テスト'
      }
    }
    
    const data = await response.json()
    console.log(`📊 Response data structure:`, Object.keys(data))
    
    // レスポンス構造の確認
    const result = data.result || {}
    const large = result.large || []
    const medium = result.medium || []
    const small = result.small || []
    
    console.log(`✅ ${testName} success: Large: ${large.length}, Medium: ${medium.length}, Small: ${small.length}`)
    
    return {
      testName,
      success: true,
      httpStatus: response.status,
      responseTime,
      categories: large.slice(0, 5).map((cat: any) => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName
      })),
      totalCategories: large.length + medium.length + small.length,
      categoryBreakdown: {
        large: large.length,
        medium: medium.length,
        small: small.length
      },
      url: apiUrl,
      note: 'すべてのカテゴリタイプを取得'
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`💥 ${testName} exception:`, error)
    
    return {
      testName,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      url: 'https://app.rakuten.co.jp/services/api/Recipe/CategoryList/20170426',
      note: 'ネットワークエラーまたは接続問題'
    }
  }
}

// カテゴリランキングAPIのテスト
async function testCategoryRankingAPI(applicationId: string, categoryId: string): Promise<TestResult> {
  const testName = 'Category Ranking API'
  const startTime = Date.now()
  
  try {
    const apiUrl = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426`
    const params = new URLSearchParams({
      applicationId,
      categoryId: categoryId.toString(),
      format: 'json'
    })
    
    const fullUrl = `${apiUrl}?${params}`
    console.log(`🌐 Testing: ${fullUrl.replace(applicationId, '***API_KEY***')}`)
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'MaalMatch-Recipe-App/1.0',
        'Accept': 'application/json'
      }
    })
    const responseTime = Date.now() - startTime
    
    console.log(`📊 Response status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ ${testName} failed:`, response.status, errorText)
      
      // 詳細なエラー解析
      let errorAnalysis = 'Unknown error'
      try {
        const errorJson = JSON.parse(errorText)
        errorAnalysis = `${errorJson.error}: ${errorJson.error_description}`
      } catch {
        errorAnalysis = errorText
      }
      
      return {
        testName,
        success: false,
        httpStatus: response.status,
        httpStatusText: response.statusText,
        responseTime,
        error: errorAnalysis,
        categoryId,
        url: apiUrl,
        requestUrl: fullUrl.replace(applicationId, '***API_KEY***'),
        note: `カテゴリID ${categoryId} のランキング取得テスト`
      }
    }
    
    const data = await response.json()
    const recipes = data.result || []
    
    console.log(`✅ ${testName} success: Found ${recipes.length} recipes in category ${categoryId}`)
    console.log(`📊 Sample recipe data:`, recipes[0] ? Object.keys(recipes[0]) : 'No recipes')
    
    return {
      testName,
      success: true,
      httpStatus: response.status,
      responseTime,
      categoryId,
      recipesFound: recipes.length,
      sampleRecipes: recipes.slice(0, 3).map((recipe: any) => ({
        recipeId: recipe.recipeId,
        recipeTitle: recipe.recipeTitle,
        nickname: recipe.nickname
      })),
      url: apiUrl,
      note: `カテゴリID ${categoryId} から ${recipes.length}件のレシピを取得`
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`💥 ${testName} exception:`, error)
    
    return {
      testName,
      success: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      categoryId,
      url: 'https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426',
      note: 'ネットワークエラーまたは接続問題'
    }
  }
} 