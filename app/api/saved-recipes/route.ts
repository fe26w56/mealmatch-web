import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

// 今週の月曜日を取得するヘルパー関数
function getThisWeekMonday() {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return monday
}

// 献立に空きがある曜日を見つけるヘルパー関数
async function findNextAvailableDay(userId: string, mealPlanId: string) {
  // 現在の献立の状況を確認
  const existingRecipes = await prisma.mealPlanRecipe.findMany({
    where: { mealPlanId },
    select: { dayOfWeek: true }
  })

  const occupiedDays = new Set(existingRecipes.map(r => r.dayOfWeek))
  
  // 月曜日(1)から金曜日(5)まで空いている日を探す
  for (let day = 1; day <= 5; day++) {
    if (!occupiedDays.has(day)) {
      return day
    }
  }
  
  // 全て埋まっている場合は、最も古いレシピがある曜日を返す
  // （後で置き換えるか、追加で配置する）
  return 1 // デフォルトで月曜日
}

// いいねしたレシピを献立に自動追加するヘルパー関数
async function addLikedRecipeToMealPlan(userId: string, savedRecipeId: string) {
  try {
    const monday = getThisWeekMonday()

    // 既存の献立を取得または作成
    let mealPlan = await prisma.mealPlan.findFirst({
      where: {
        userId,
        weekStart: monday,
      },
    })

    if (!mealPlan) {
      // 献立が存在しない場合は作成
      mealPlan = await prisma.mealPlan.create({
        data: {
          userId,
          weekStart: monday,
        },
      })
    }

    // 次に利用可能な曜日を見つける
    const nextDay = await findNextAvailableDay(userId, mealPlan.id)

    // 献立にレシピを追加
    const mealPlanRecipe = await prisma.mealPlanRecipe.create({
      data: {
        mealPlanId: mealPlan.id,
        savedRecipeId,
        dayOfWeek: nextDay,
        mealType: 'dinner',
      },
      include: {
        savedRecipe: true,
      },
    })

    console.log(`レシピを献立に追加しました: ${mealPlanRecipe.savedRecipe.recipeTitle} (${nextDay === 1 ? '月' : nextDay === 2 ? '火' : nextDay === 3 ? '水' : nextDay === 4 ? '木' : '金'}曜日)`)
    
    return mealPlanRecipe
  } catch (error) {
    console.error('Failed to add recipe to meal plan:', error)
    // エラーが発生してもレシピ保存は成功させる
    return null
  }
}

// いいねしたレシピ一覧の取得
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const liked = searchParams.get('liked')

    const savedRecipes = await prisma.savedRecipe.findMany({
      where: {
        userId: user.id,
        ...(liked === 'true' ? { liked: true } : {}),
        ...(liked === 'false' ? { liked: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(savedRecipes)
  } catch (error) {
    console.error('Failed to fetch saved recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved recipes' },
      { status: 500 }
    )
  }
}

// レシピを保存（いいね/いいえ）
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      recipeId,
      recipeTitle,
      recipeUrl,
      foodImageUrl,
      recipeDescription,
      recipeMaterial,
      recipeIndication,
      shopName,
      liked
    } = await request.json()

    const savedRecipe = await prisma.savedRecipe.upsert({
      where: {
        userId_recipeId: {
          userId: user.id,
          recipeId: recipeId,
        },
      },
      update: { liked },
      create: {
        recipeId,
        recipeTitle,
        recipeUrl,
        foodImageUrl,
        recipeDescription,
        recipeMaterial: Array.isArray(recipeMaterial) ? JSON.stringify(recipeMaterial) : recipeMaterial,
        recipeIndication,
        shopName,
        userId: user.id,
        liked,
      },
    })

    // いいねした場合は献立に自動追加
    if (liked) {
      await addLikedRecipeToMealPlan(user.id, savedRecipe.id)
    }

    return NextResponse.json(savedRecipe)
  } catch (error) {
    console.error('Failed to save recipe:', error)
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    )
  }
} 