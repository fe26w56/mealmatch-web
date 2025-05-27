import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

// 今週の献立を取得または作成
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 今週の月曜日を取得
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    // 既存の献立をチェック
    let mealPlan = await prisma.mealPlan.findFirst({
      where: {
        userId: user.id,
        weekStart: monday,
      },
      include: {
        recipes: {
          include: {
            savedRecipe: true,
          },
        },
      },
    })

    // 献立が存在しない場合、いいねしたレシピから自動作成
    if (!mealPlan) {
      const likedRecipes = await prisma.savedRecipe.findMany({
        where: {
          userId: user.id,
          liked: true,
        },
        take: 5, // 平日5日分
        orderBy: { createdAt: 'desc' },
      })

      if (likedRecipes.length > 0) {
        mealPlan = await prisma.mealPlan.create({
          data: {
            userId: user.id,
            weekStart: monday,
            recipes: {
              create: likedRecipes.slice(0, 5).map((recipe, index: number) => ({
                savedRecipeId: recipe.id,
                dayOfWeek: index, // 0=月曜日, 1=火曜日, ...
                mealType: 'dinner', // 夕食として設定
              })),
            },
          },
          include: {
            recipes: {
              include: {
                savedRecipe: true,
              },
            },
          },
        })
      } else {
        // いいねしたレシピがない場合は空の献立を作成
        mealPlan = await prisma.mealPlan.create({
          data: {
            userId: user.id,
            weekStart: monday,
          },
          include: {
            recipes: {
              include: {
                savedRecipe: true,
              },
            },
          },
        })
      }
    }

    return NextResponse.json(mealPlan)
  } catch (error) {
    console.error('Failed to fetch meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meal plan' },
      { status: 500 }
    )
  }
}

// 献立を更新
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mealPlanId, dayOfWeek, mealType, savedRecipeId } = await request.json()

    const mealPlanRecipe = await prisma.mealPlanRecipe.upsert({
      where: {
        mealPlanId_dayOfWeek_mealType: {
          mealPlanId,
          dayOfWeek,
          mealType,
        },
      },
      update: { savedRecipeId },
      create: {
        mealPlanId,
        dayOfWeek,
        mealType,
        savedRecipeId,
      },
      include: {
        savedRecipe: true,
      },
    })

    return NextResponse.json(mealPlanRecipe)
  } catch (error) {
    console.error('Failed to update meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to update meal plan' },
      { status: 500 }
    )
  }
}

// 献立の並び替え
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mealPlanId, reorderedRecipes } = await request.json()

    // 既存の献立レシピを削除
    await prisma.mealPlanRecipe.deleteMany({
      where: {
        mealPlanId,
      },
    })

    // 新しい順序で献立レシピを作成
    const newMealPlanRecipes = await prisma.$transaction(
      reorderedRecipes.map((recipe: any, index: number) =>
        prisma.mealPlanRecipe.create({
          data: {
            mealPlanId,
            savedRecipeId: recipe.savedRecipeId,
            dayOfWeek: index,
            mealType: 'dinner',
          },
          include: {
            savedRecipe: true,
          },
        })
      )
    )

    return NextResponse.json(newMealPlanRecipes)
  } catch (error) {
    console.error('Failed to reorder meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to reorder meal plan' },
      { status: 500 }
    )
  }
} 