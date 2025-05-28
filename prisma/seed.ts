import { PrismaClient } from '@prisma/client'
import { scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)
const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scryptAsync(password, salt, 64) as Buffer
  return `${salt}:${derivedKey.toString('hex')}`
}

// 楽天レシピAPIからレシピを取得する関数（再試行機能付き）
async function fetchRakutenRecipes(categoryId: string, page: number = 1, retryCount: number = 0): Promise<any[]> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID
  if (!applicationId) {
    console.error('❌ RAKUTEN_APPLICATION_ID is not set in environment variables')
    return []
  }

  try {
    const url = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?applicationId=${applicationId}&categoryId=${categoryId}&page=${page}`
    console.log(`🔍 Fetching recipes from category: ${categoryId}, page: ${page} (attempt ${retryCount + 1})`)
    
    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 429) {
        if (retryCount < 3) {
          const waitTime = (retryCount + 1) * 10000 // 10秒、20秒、30秒と増加
          console.log(`⏳ Rate limit hit for category ${categoryId}, page ${page}. Waiting ${waitTime/1000} seconds before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          return fetchRakutenRecipes(categoryId, page, retryCount + 1)
        } else {
          console.log(`❌ Max retries reached for category ${categoryId}, page ${page}`)
          return []
        }
      }
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`)
      return []
    }

    const data = await response.json()
    if (data.result && data.result.length > 0) {
      console.log(`✅ Fetched ${data.result.length} recipes for category: ${categoryId}, page: ${page}`)
      return data.result
    } else {
      console.log(`⚠️ No recipes found for category: ${categoryId}, page: ${page}`)
      return []
    }
  } catch (error) {
    console.error(`❌ Error fetching recipes for category ${categoryId}:`, error)
    if (retryCount < 2) {
      console.log(`🔄 Retrying in 5 seconds...`)
      await new Promise(resolve => setTimeout(resolve, 5000))
      return fetchRakutenRecipes(categoryId, page, retryCount + 1)
    }
    return []
  }
}

// キーワード検索でレシピを取得する関数（再試行機能付き）
async function fetchRakutenRecipesByKeyword(keyword: string, page: number = 1, retryCount: number = 0): Promise<any[]> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID
  if (!applicationId) {
    console.error('❌ RAKUTEN_APPLICATION_ID is not set in environment variables')
    return []
  }

  try {
    const url = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?applicationId=${applicationId}&keyword=${encodeURIComponent(keyword)}&page=${page}`
    console.log(`🔍 Searching recipes with keyword: ${keyword}, page: ${page} (attempt ${retryCount + 1})`)
    
    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 429) {
        if (retryCount < 3) {
          const waitTime = (retryCount + 1) * 10000 // 10秒、20秒、30秒と増加
          console.log(`⏳ Rate limit hit for keyword ${keyword}, page ${page}. Waiting ${waitTime/1000} seconds before retry...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          return fetchRakutenRecipesByKeyword(keyword, page, retryCount + 1)
        } else {
          console.log(`❌ Max retries reached for keyword ${keyword}, page ${page}`)
          return []
        }
      }
      console.error(`❌ API request failed: ${response.status} ${response.statusText}`)
      return []
    }

    const data = await response.json()
    if (data.result && data.result.length > 0) {
      console.log(`✅ Found ${data.result.length} recipes for keyword: ${keyword}, page: ${page}`)
      return data.result
    } else {
      console.log(`⚠️ No recipes found for keyword: ${keyword}, page: ${page}`)
      return []
    }
  } catch (error) {
    console.error(`❌ Error searching recipes for keyword ${keyword}:`, error)
    if (retryCount < 2) {
      console.log(`🔄 Retrying in 5 seconds...`)
      await new Promise(resolve => setTimeout(resolve, 5000))
      return fetchRakutenRecipesByKeyword(keyword, page, retryCount + 1)
    }
    return []
  }
}

// 楽天APIから大量のレシピを段階的に取得
async function fetchManyRecipesFromAPI(): Promise<any[]> {
  // より多くのカテゴリID（楽天レシピの全カテゴリ）
  const categories = [
    '30', // ご飯もの
    '31', // パン
    '32', // 麺類
    '33', // 汁物・スープ
    '34', // おかず
    '35', // サラダ
    '36', // 飲み物
    '37', // デザート
    '38', // その他
    '39', // お弁当
    '40', // 調味料・ソース
    '41', // 離乳食
    '14', // 肉料理
    '15', // 魚料理
    '16', // 野菜料理
    '17', // 卵料理
    '18', // 豆腐料理
    '19', // 鍋料理
    '20', // 炒め物
    '21', // 煮物
    '22', // 焼き物
    '23', // 揚げ物
    '24', // 蒸し物
    '25', // 和え物
  ]

  // より多くの人気キーワード
  const keywords = [
    // 基本料理
    '唐揚げ', 'ハンバーグ', 'カレー', 'パスタ', 'ラーメン', '寿司', '天ぷら', 'とんかつ',
    'オムライス', 'チャーハン', '餃子', 'ピザ', 'サラダ', 'スープ', 'ケーキ',
    
    // 和食
    '肉じゃが', '親子丼', '照り焼き', '煮物', '味噌汁', '刺身', '焼き魚', 'おにぎり',
    'うどん', 'そば', '茶碗蒸し', '筑前煮', '豚汁', '炊き込みご飯',
    
    // 洋食
    'グラタン', 'ステーキ', 'シチュー', 'リゾット', 'ドリア', 'サンドイッチ',
    'ローストビーフ', 'キッシュ', 'ラザニア', 'ミネストローネ',
    
    // 中華
    '麻婆豆腐', '酢豚', 'エビチリ', '春巻き', '回鍋肉', '青椒肉絲', '八宝菜',
    '担々麺', '小籠包', 'ワンタン', '中華丼',
    
    // 麺類
    '焼きそば', 'ペペロンチーノ', 'カルボナーラ', 'ミートソース', 'ナポリタン',
    'つけ麺', '冷やし中華', 'ちゃんぽん',
    
    // 揚げ物
    'エビフライ', 'コロッケ', 'チキンカツ', 'メンチカツ', 'アジフライ',
    'イカフライ', 'カキフライ', '串カツ',
    
    // ご飯もの
    'カツ丼', '牛丼', '豚丼', '海鮮丼', 'ちらし寿司', 'ピラフ', 'ビビンバ',
    'ガパオライス', 'ハヤシライス', 'ロコモコ',
    
    // デザート
    'プリン', 'ティラミス', 'チーズケーキ', 'パンケーキ', 'ワッフル',
    'フレンチトースト', 'クッキー', 'ドーナツ', 'マカロン'
  ]

  let allRecipes: any[] = []
  let totalRequests = 0
  const maxRequests = 200 // 最大リクエスト数を制限

  console.log('🚀 Starting comprehensive recipe fetch from Rakuten API...')
  console.log(`📊 Will fetch from ${categories.length} categories and ${keywords.length} keywords`)

  // フェーズ1: カテゴリ別検索
  console.log('\n📂 Phase 1: Fetching recipes by categories...')
  for (const [categoryIndex, category] of categories.entries()) {
    if (totalRequests >= maxRequests) {
      console.log(`⚠️ Reached maximum request limit (${maxRequests}). Stopping category search.`)
      break
    }

    console.log(`📂 Processing category: ${category} (${categoryIndex + 1}/${categories.length})`)
    
    // 各カテゴリから最大5ページ取得
    for (let page = 1; page <= 5; page++) {
      if (totalRequests >= maxRequests) break

      const recipes = await fetchRakutenRecipes(category, page)
      totalRequests++
      
      if (recipes.length > 0) {
        allRecipes = allRecipes.concat(recipes)
        console.log(`📈 Total recipes so far: ${allRecipes.length}`)
        
        // APIレート制限を考慮して待機
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        console.log(`⏭️ No more recipes in category ${category}, moving to next category`)
        break
      }
    }
    
    // カテゴリ間でも待機
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // フェーズ2: キーワード検索
  console.log('\n🔍 Phase 2: Fetching recipes by keywords...')
  for (const [keywordIndex, keyword] of keywords.entries()) {
    if (totalRequests >= maxRequests) {
      console.log(`⚠️ Reached maximum request limit (${maxRequests}). Stopping keyword search.`)
      break
    }

    console.log(`🔍 Processing keyword: ${keyword} (${keywordIndex + 1}/${keywords.length})`)
    
    // 各キーワードから最大3ページ取得
    for (let page = 1; page <= 3; page++) {
      if (totalRequests >= maxRequests) break

      const recipes = await fetchRakutenRecipesByKeyword(keyword, page)
      totalRequests++
      
      if (recipes.length > 0) {
        allRecipes = allRecipes.concat(recipes)
        console.log(`📈 Total recipes so far: ${allRecipes.length}`)
        
        // APIレート制限を考慮して待機
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        console.log(`⏭️ No more recipes for keyword ${keyword}, moving to next keyword`)
        break
      }
    }
    
    // キーワード間でも待機
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // 重複を除去（recipeIdベース）
  const uniqueRecipes = allRecipes.filter((recipe, index, self) => 
    index === self.findIndex(r => r.recipeId === recipe.recipeId)
  )

  console.log(`\n🎉 API fetch completed!`)
  console.log(`📊 Total API requests made: ${totalRequests}`)
  console.log(`📊 Total recipes fetched: ${allRecipes.length}`)
  console.log(`🎯 Unique recipes after deduplication: ${uniqueRecipes.length}`)
  
  return uniqueRecipes
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@maalmatch.com'
  const adminName = process.env.ADMIN_NAME || 'Administrator'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234'
  const adminRole = process.env.ADMIN_ROLE || 'admin'

  // 既存の管理者ユーザーをチェック
  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!adminUser) {
  // パスワードをハッシュ化
  const hashedPassword = await hashPassword(adminPassword)

  // 管理者ユーザーを作成
    adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: adminRole,
    },
  })

  console.log('✅ Admin user created:', adminEmail)
  } else {
    console.log('✅ Admin user already exists:', adminEmail)
  }

  // 既存のレシピをすべて削除（偽データをクリア）
  const deletedCount = await prisma.savedRecipe.deleteMany({
    where: { userId: adminUser.id }
  })
  console.log(`🗑️ Deleted ${deletedCount.count} existing recipes (clearing all data)`)

  // 楽天APIから大量のレシピを取得
  console.log('🚀 Starting massive recipe import from Rakuten API...')
  const rakutenRecipes = await fetchManyRecipesFromAPI()

  if (rakutenRecipes.length === 0) {
    console.log('❌ No recipes fetched from Rakuten API.')
    console.log('')
    console.log('📝 To get Rakuten API key:')
    console.log('1. Visit https://webservice.rakuten.co.jp/')
    console.log('2. Register/Login with Rakuten account')
    console.log('3. Create new application to get Application ID')
    console.log('4. Add RAKUTEN_APPLICATION_ID=your_app_id to .env file')
    console.log('')
    console.log('⚠️ Make sure your API key has sufficient quota and permissions')
    console.log('')
    return
  }

  console.log(`\n🚀 Creating ${rakutenRecipes.length} recipes from Rakuten API...`)

  let createdCount = 0
  let skippedCount = 0

  for (const [index, recipe] of rakutenRecipes.entries()) {
    try {
      // 重複チェック：同じrecipeIdのレシピが既に存在するかチェック
      const existingRecipe = await prisma.savedRecipe.findFirst({
        where: {
          userId: adminUser.id,
          recipeId: recipe.recipeId?.toString() || `rakuten_${index}`
        }
      })

      if (!existingRecipe) {
        // 楽天APIのデータを使用してレシピを作成
    await prisma.savedRecipe.create({
      data: {
            recipeId: recipe.recipeId?.toString() || `rakuten_${Date.now()}_${index}`,
            recipeTitle: recipe.recipeTitle || 'タイトル不明',
            recipeDescription: recipe.recipeDescription || '',
            foodImageUrl: recipe.foodImageUrl || recipe.mediumImageUrl || recipe.smallImageUrl || '',
            recipeIndication: recipe.recipeIndication || '',
            recipeMaterial: recipe.recipeMaterial ? JSON.stringify(recipe.recipeMaterial) : '[]',
            recipeInstructions: recipe.recipeInstructions || '',
            recipeUrl: recipe.recipeUrl || '',
            shopName: recipe.shopName || '楽天レシピ',
        userId: adminUser.id,
        liked: true
      }
    })
        createdCount++
      } else {
        skippedCount++
      }

      // 進捗表示
      if ((index + 1) % 50 === 0) {
        console.log(`✅ Processed ${index + 1}/${rakutenRecipes.length} recipes (${createdCount} new, ${skippedCount} skipped)`)
      }
    } catch (error) {
      console.error(`❌ Error creating recipe ${index}:`, error)
      skippedCount++
    }
  }

  console.log(`\n✅ Successfully processed ${rakutenRecipes.length} recipes!`)
  console.log(`📊 Created ${createdCount} new recipes`)
  console.log(`📊 Skipped ${skippedCount} duplicate/error recipes`)
  
  // 最終的なレシピ数を表示
  const finalRecipeCount = await prisma.savedRecipe.count({
    where: { userId: adminUser.id }
  })
  console.log(`📊 Total recipe count in database: ${finalRecipeCount}`)

  // 成功メッセージ
  console.log('')
  console.log('🎉 MASSIVE RECIPE IMPORT COMPLETED!')
  console.log('🍳 Your MealMatch app now has tons of real recipes from Rakuten API!')
  console.log('📱 You can now browse through hundreds of authentic Japanese recipes!')
  console.log('')

  // セキュリティ警告
  if (adminPassword === 'admin1234') {
    console.log('⚠️  SECURITY WARNING:')
    console.log('   Default admin password is being used!')
    console.log('   Please change ADMIN_PASSWORD in your .env.local file')
    console.log('   for production use.')
    console.log('')
  }

  // 楽天API設定の確認
  if (!process.env.RAKUTEN_APPLICATION_ID) {
    console.log('⚠️  RAKUTEN API WARNING:')
    console.log('   RAKUTEN_APPLICATION_ID is not set!')
    console.log('   Please add your Rakuten Application ID to .env file')
    console.log('   RAKUTEN_APPLICATION_ID=your_application_id_here')
    console.log('')
    console.log('📝 How to get Rakuten API key:')
    console.log('1. Visit https://webservice.rakuten.co.jp/')
    console.log('2. Register/Login with Rakuten account')
    console.log('3. Create new application to get Application ID')
    console.log('4. Add the ID to your .env file')
    console.log('')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 