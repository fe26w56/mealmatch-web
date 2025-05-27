// モックレシピカテゴリデータ
export const mockCategories = {
  large: [
    {
      categoryId: '30',
      categoryName: '人気メニュー',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/30/'
    },
    {
      categoryId: '31',
      categoryName: '定番の肉料理',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/31/'
    },
    {
      categoryId: '32',
      categoryName: '定番の魚料理',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/32/'
    },
    {
      categoryId: '33',
      categoryName: '卵料理',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/33/'
    },
    {
      categoryId: '34',
      categoryName: 'ご飯もの',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/34/'
    },
    {
      categoryId: '35',
      categoryName: 'パスタ',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/35/'
    },
    {
      categoryId: '36',
      categoryName: '麺・粉物料理',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/36/'
    },
    {
      categoryId: '37',
      categoryName: '汁物・スープ',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/37/'
    },
    {
      categoryId: '38',
      categoryName: 'サラダ',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/38/'
    },
    {
      categoryId: '39',
      categoryName: '野菜のおかず',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/39/'
    }
  ],
  medium: [
    {
      categoryId: '275',
      categoryName: '牛肉',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/31-275/',
      parentCategoryId: '31'
    },
    {
      categoryId: '276',
      categoryName: '豚肉',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/31-276/',
      parentCategoryId: '31'
    },
    {
      categoryId: '277',
      categoryName: '鶏肉',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/31-277/',
      parentCategoryId: '31'
    },
    {
      categoryId: '278',
      categoryName: 'ひき肉',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/31-278/',
      parentCategoryId: '31'
    },
    {
      categoryId: '339',
      categoryName: '煮魚',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/32-339/',
      parentCategoryId: '32'
    },
    {
      categoryId: '340',
      categoryName: '焼き魚',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/32-340/',
      parentCategoryId: '32'
    }
  ],
  small: [
    {
      categoryId: '516',
      categoryName: '牛肉薄切り',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/31-275-516/',
      parentCategoryId: '275'
    },
    {
      categoryId: '517',
      categoryName: '牛ステーキ肉',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/31-275-517/',
      parentCategoryId: '275'
    },
    {
      categoryId: '518',
      categoryName: '牛かたまり肉',
      categoryUrl: 'https://recipe.rakuten.co.jp/category/31-275-518/',
      parentCategoryId: '275'
    }
  ]
}

// モックレシピデータ
export const mockRecipes = [
  {
    recipeId: 'mock_001',
    recipeTitle: '基本の鶏の唐揚げ',
    recipeDescription: 'サクサクジューシーな定番の唐揚げです',
    foodImageUrl: 'https://picsum.photos/300/200?random=1',
    recipeMaterial: ['鶏もも肉 300g', '醤油 大さじ2', '酒 大さじ1', '生姜 1片', 'にんにく 1片', '片栗粉 適量', '揚げ油 適量'],
    recipeIndication: '30分',
    recipeInstructions: '1. 鶏肉を一口大に切り、余分な水分を拭き取る\n2. 醤油、酒、生姜、にんにくなどの調味料に30分以上漬け込む\n3. 片栗粉または小麦粉をまぶし、余分な粉を落とす\n4. 170℃の油で3-4分揚げ、一度取り出す\n5. 180℃の高温で1-2分二度揚げしてカリッと仕上げる\n6. 油をよく切って器に盛り付ける',
    recipeUrl: '#mock-recipe-001',
    categoryName: '鶏肉',
    nickname: 'レシピマスター',
    recipePublishday: '2024/01/15',
    shop: 0,
    pickup: 1,
    rank: '1'
  },
  {
    recipeId: 'mock_002',
    recipeTitle: '野菜たっぷりカレー',
    recipeDescription: '野菜の甘みが美味しいヘルシーカレーです',
    foodImageUrl: 'https://picsum.photos/300/200?random=2',
    recipeMaterial: ['玉ねぎ 2個', '人参 1本', 'じゃがいも 2個', '牛肉 200g', 'カレールー 1/2箱', '水 600ml'],
    recipeIndication: '45分',
    recipeInstructions: '1. 野菜（玉ねぎ、人参、じゃがいも）を一口大に切る\n2. 肉も食べやすい大きさに切る\n3. フライパンで玉ねぎを透明になるまで炒める\n4. 肉を加えて色が変わるまで炒める\n5. 他の野菜を加えてさらに炒める\n6. 水を加えて15-20分煮込む\n7. カレールーを溶かし入れ、とろみがつくまで煮込む\n8. ご飯と一緒に盛り付ける',
    recipeUrl: '#mock-recipe-002',
    categoryName: '人気メニュー',
    nickname: 'カレー職人',
    recipePublishday: '2024/01/14',
    shop: 0,
    pickup: 1,
    rank: '2'
  },
  {
    recipeId: 'mock_003',
    recipeTitle: 'ふわふわハンバーグ',
    recipeDescription: 'ジューシーで柔らかいハンバーグです',
    foodImageUrl: 'https://picsum.photos/300/200?random=3',
    recipeMaterial: ['合いびき肉 300g', '玉ねぎ 1個', 'パン粉 1/2カップ', '牛乳 大さじ3', '卵 1個', '塩胡椒 少々'],
    recipeIndication: '40分',
    recipeInstructions: '1. 玉ねぎをみじん切りにして炒め、冷ましておく\n2. パン粉を牛乳に浸してふやかす\n3. ひき肉、炒めた玉ねぎ、パン粉、卵を混ぜ合わせる\n4. 塩胡椒で味付けし、よく練り混ぜる\n5. 楕円形に成形し、中央を少しくぼませる\n6. フライパンで両面を焼き色がつくまで焼く\n7. 蓋をして弱火で10-15分蒸し焼きにする\n8. お好みのソースをかけて完成',
    recipeUrl: '#mock-recipe-003',
    categoryName: 'ひき肉',
    nickname: 'ハンバーグ名人',
    recipePublishday: '2024/01/13',
    shop: 0,
    pickup: 0,
    rank: '3'
  }
] 