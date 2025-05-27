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

// 実際の人気レシピデータを生成（楽天レシピAPIの形式に近い）
function generateRealRecipes(count: number = 1000): any[] {
  const realRecipes = [
    // 和食
    { title: '鶏の唐揚げ', description: 'サクサクジューシーな定番唐揚げ', materials: ['鶏もも肉 500g', '醤油 大さじ2', '酒 大さじ1', '生姜 1片', 'にんにく 1片', '片栗粉 適量', '揚げ油 適量'], time: '30分', instructions: '1. 鶏肉を一口大に切る\n2. 調味料に漬け込む\n3. 片栗粉をまぶして揚げる' },
    { title: '肉じゃが', description: '家庭の味の定番煮物', materials: ['じゃがいも 4個', '玉ねぎ 1個', '牛肉 200g', '人参 1本', '醤油 大さじ3', 'みりん 大さじ2', '砂糖 大さじ1', 'だし汁 300ml'], time: '45分', instructions: '1. 野菜を切る\n2. 牛肉を炒める\n3. 野菜を加えて煮込む' },
    { title: '親子丼', description: 'ふわとろ卵の絶品丼', materials: ['鶏もも肉 150g', '卵 3個', '玉ねぎ 1/2個', 'ご飯 2杯分', '醤油 大さじ2', 'みりん 大さじ2', 'だし汁 100ml'], time: '20分', instructions: '1. 鶏肉と玉ねぎを煮る\n2. 溶き卵を加える\n3. ご飯にのせる' },
    { title: '天ぷら', description: 'サクサク衣の本格天ぷら', materials: ['エビ 8尾', 'なす 1本', 'ピーマン 2個', '薄力粉 100g', '冷水 150ml', '卵 1個', '揚げ油 適量'], time: '40分', instructions: '1. 具材を切る\n2. 衣を作る\n3. 揚げる' },
    { title: 'みそ汁', description: '毎日飲みたい基本のみそ汁', materials: ['だし汁 400ml', 'みそ 大さじ2', 'わかめ 適量', '豆腐 1/2丁', 'ねぎ 適量'], time: '10分', instructions: '1. だし汁を温める\n2. みそを溶く\n3. 具材を加える' },
    
    // 洋食
    { title: 'ハンバーグ', description: 'ジューシーな手作りハンバーグ', materials: ['合いびき肉 300g', '玉ねぎ 1個', 'パン粉 1/2カップ', '牛乳 大さじ2', '卵 1個', '塩こしょう 適量'], time: '35分', instructions: '1. 玉ねぎを炒める\n2. 材料を混ぜる\n3. 焼く' },
    { title: 'オムライス', description: 'ふわふわ卵のオムライス', materials: ['ご飯 2杯分', '鶏肉 100g', '玉ねぎ 1/2個', '卵 4個', 'ケチャップ 大さじ4', 'バター 20g'], time: '25分', instructions: '1. チキンライスを作る\n2. 卵を焼く\n3. 包む' },
    { title: 'パスタ ペペロンチーノ', description: 'シンプルで美味しいパスタ', materials: ['スパゲッティ 200g', 'にんにく 2片', '唐辛子 1本', 'オリーブオイル 大さじ3', 'パセリ 適量'], time: '15分', instructions: '1. パスタを茹でる\n2. にんにくを炒める\n3. 和える' },
    { title: 'グラタン', description: 'とろーりチーズのグラタン', materials: ['マカロニ 150g', '鶏肉 100g', '玉ねぎ 1個', 'バター 30g', '薄力粉 大さじ2', '牛乳 300ml', 'チーズ 100g'], time: '50分', instructions: '1. ホワイトソースを作る\n2. 具材と混ぜる\n3. オーブンで焼く' },
    { title: 'ステーキ', description: '本格的な牛ステーキ', materials: ['牛ステーキ肉 2枚', '塩こしょう 適量', 'にんにく 1片', 'バター 20g', '醤油 小さじ1'], time: '20分', instructions: '1. 肉を常温に戻す\n2. 焼く\n3. 休ませる' },
    
    // 中華
    { title: '麻婆豆腐', description: 'ピリ辛で美味しい麻婆豆腐', materials: ['豆腐 1丁', '豚ひき肉 100g', '長ねぎ 1本', '豆板醤 小さじ1', '醤油 大さじ1', '鶏がらスープ 100ml'], time: '20分', instructions: '1. 豆腐を切る\n2. ひき肉を炒める\n3. 煮込む' },
    { title: 'チャーハン', description: 'パラパラ炒飯', materials: ['ご飯 2杯分', '卵 2個', 'ハム 50g', 'ねぎ 1本', '醤油 大さじ1', '塩こしょう 適量'], time: '15分', instructions: '1. 卵を炒める\n2. ご飯を加える\n3. 調味する' },
    { title: '餃子', description: '手作り餃子', materials: ['餃子の皮 30枚', '豚ひき肉 200g', 'キャベツ 200g', 'にら 50g', '醤油 大さじ1', 'ごま油 小さじ1'], time: '60分', instructions: '1. 餡を作る\n2. 包む\n3. 焼く' },
    { title: '酢豚', description: '甘酸っぱい酢豚', materials: ['豚肉 200g', 'ピーマン 2個', '玉ねぎ 1個', 'パイナップル 100g', '酢 大さじ2', '砂糖 大さじ2', 'ケチャップ 大さじ2'], time: '35分', instructions: '1. 豚肉を揚げる\n2. 野菜を炒める\n3. 甘酢あんを絡める' },
    { title: 'エビチリ', description: 'プリプリエビのチリソース', materials: ['エビ 200g', '長ねぎ 1本', 'にんにく 1片', '生姜 1片', 'ケチャップ 大さじ2', '豆板醤 小さじ1'], time: '25分', instructions: '1. エビの下処理\n2. 炒める\n3. ソースを絡める' },
    
    // カレー
    { title: 'ビーフカレー', description: '本格的なビーフカレー', materials: ['牛肉 300g', '玉ねぎ 2個', 'じゃがいも 2個', '人参 1本', 'カレールー 1箱', '水 600ml'], time: '90分', instructions: '1. 野菜を切る\n2. 肉を炒める\n3. 煮込む' },
    { title: 'チキンカレー', description: 'まろやかチキンカレー', materials: ['鶏もも肉 300g', '玉ねぎ 2個', 'じゃがいも 2個', '人参 1本', 'カレールー 1箱', '水 600ml'], time: '60分', instructions: '1. 野菜を切る\n2. 鶏肉を炒める\n3. 煮込む' },
    { title: 'キーマカレー', description: 'スパイシーなキーマカレー', materials: ['合いびき肉 300g', '玉ねぎ 2個', 'トマト 1個', 'にんにく 2片', 'カレー粉 大さじ2', 'トマト缶 1缶'], time: '45分', instructions: '1. 玉ねぎを炒める\n2. ひき肉を加える\n3. スパイスで煮込む' },
    
    // 麺類
    { title: 'ラーメン', description: '醤油ベースのラーメン', materials: ['中華麺 2玉', 'チャーシュー 4枚', 'メンマ 適量', 'ねぎ 適量', '醤油 大さじ2', '鶏がらスープ 400ml'], time: '30分', instructions: '1. スープを作る\n2. 麺を茹でる\n3. 盛り付ける' },
    { title: '焼きそば', description: 'ソース焼きそば', materials: ['中華麺 2玉', 'キャベツ 200g', '豚肉 100g', 'もやし 100g', '焼きそばソース 大さじ3'], time: '15分', instructions: '1. 野菜を切る\n2. 炒める\n3. ソースで味付け' },
    { title: 'うどん', description: 'かけうどん', materials: ['うどん 2玉', 'だし汁 400ml', '醤油 大さじ1', 'みりん 大さじ1', 'ねぎ 適量', 'かまぼこ 適量'], time: '10分', instructions: '1. だしを温める\n2. うどんを茹でる\n3. 盛り付ける' },
    
    // デザート
    { title: 'プリン', description: 'なめらかプリン', materials: ['卵 3個', '牛乳 300ml', '砂糖 60g', 'バニラエッセンス 少々'], time: '120分', instructions: '1. カラメルを作る\n2. プリン液を作る\n3. 蒸す' },
    { title: 'ケーキ', description: 'スポンジケーキ', materials: ['卵 4個', '薄力粉 100g', '砂糖 80g', 'バター 30g'], time: '90分', instructions: '1. 卵を泡立てる\n2. 粉を混ぜる\n3. 焼く' },
    { title: 'クッキー', description: 'バタークッキー', materials: ['薄力粉 200g', 'バター 100g', '砂糖 60g', '卵 1個'], time: '60分', instructions: '1. バターを練る\n2. 材料を混ぜる\n3. 焼く' }
  ]

  const recipes: any[] = []
  
  // 基本レシピを複数回使用してバリエーションを作成
  for (let i = 0; i < count; i++) {
    const baseRecipe = realRecipes[i % realRecipes.length]
    const variation = Math.floor(i / realRecipes.length) + 1
    
    recipes.push({
      recipeTitle: variation > 1 ? `${baseRecipe.title} (レシピ${variation})` : baseRecipe.title,
      recipeDescription: baseRecipe.description,
      foodImageUrl: `https://picsum.photos/400/300?random=${i + 2000}`,
      recipeIndication: baseRecipe.time,
      recipeMaterial: JSON.stringify(baseRecipe.materials),
      recipeInstructions: baseRecipe.instructions,
      shopName: '楽天レシピ',
      category: '人気レシピ'
    })
  }

  return recipes
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@maalmatch.com'
  const adminName = process.env.ADMIN_NAME || 'Administrator'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin1234'

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
      },
    })

    console.log('✅ Admin user created:', adminEmail)
  } else {
    console.log('✅ Admin user already exists:', adminEmail)
  }

  // 既存のレシピをすべて削除
  const deletedCount = await prisma.savedRecipe.deleteMany({
    where: { userId: adminUser.id }
  })
  console.log(`🗑️ Deleted ${deletedCount.count} existing recipes`)

  // 大量の実際のレシピを生成
  const recipeCount = 1000 // 1000個のレシピを生成
  console.log(`🚀 Generating ${recipeCount} real recipes...`)
  const realRecipes = generateRealRecipes(recipeCount)

  console.log(`🚀 Creating ${realRecipes.length} real recipes...`)

  let createdCount = 0

  for (const [index, recipe] of realRecipes.entries()) {
    try {
      const recipeId = `real_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
      
      await prisma.savedRecipe.create({
        data: {
          recipeId,
          recipeTitle: recipe.recipeTitle,
          recipeDescription: recipe.recipeDescription,
          foodImageUrl: recipe.foodImageUrl,
          recipeIndication: recipe.recipeIndication,
          recipeMaterial: recipe.recipeMaterial,
          recipeInstructions: recipe.recipeInstructions,
          recipeUrl: `#real-recipe-${recipeId}`,
          shopName: recipe.shopName,
          userId: adminUser.id,
          liked: true
        }
      })
      createdCount++

      // 進捗表示
      if ((index + 1) % 100 === 0) {
        console.log(`✅ Created ${index + 1}/${realRecipes.length} recipes`)
      }
    } catch (error) {
      console.error(`❌ Error creating recipe ${index}:`, error)
    }
  }

  console.log(`✅ Successfully created ${createdCount} real recipes!`)
  
  // 最終的なレシピ数を表示
  const finalRecipeCount = await prisma.savedRecipe.count({
    where: { userId: adminUser.id }
  })
  console.log(`📊 Total recipe count: ${finalRecipeCount}`)

  // セキュリティ警告
  if (adminPassword === 'admin1234') {
    console.log('')
    console.log('⚠️  SECURITY WARNING:')
    console.log('   Default admin password is being used!')
    console.log('   Please change ADMIN_PASSWORD in your .env.local file')
    console.log('   for production use.')
    console.log('')
  }

  console.log('')
  console.log('🎉 Real recipe data import completed!')
  console.log('💡 These recipes are based on popular Japanese dishes')
  console.log('💡 To use actual Rakuten API data, set up RAKUTEN_APPLICATION_ID in .env')
  console.log('')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 