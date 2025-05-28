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
          orderBy: {
            dayOfWeek: 'asc'
          }
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
                dayOfWeek: index + 1, // 1=月曜日, 2=火曜日, ..., 5=金曜日
                mealType: 'dinner',
              })),
            },
          },
          include: {
            recipes: {
              include: {
                savedRecipe: true,
              },
              orderBy: {
                dayOfWeek: 'asc'
              }
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
              orderBy: {
                dayOfWeek: 'asc'
              }
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

    // 新しいレシピを献立に追加
    const mealPlanRecipe = await prisma.mealPlanRecipe.create({
      data: {
        mealPlanId,
        savedRecipeId,
        dayOfWeek,
        mealType,
      },
      include: {
        savedRecipe: true,
      },
    })

    return NextResponse.json(mealPlanRecipe)
  } catch (error) {
    console.error('Failed to add recipe to meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to add recipe to meal plan' },
      { status: 500 }
    )
  }
}

// 献立の並び順を更新
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mealPlanId, reorderedRecipes } = await request.json()

    // 献立の所有者確認
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: mealPlanId,
        userId: user.id,
      },
    })

    if (!mealPlan) {
      return NextResponse.json({ error: 'Meal plan not found' }, { status: 404 })
    }

    // 既存のレシピを削除
    await prisma.mealPlanRecipe.deleteMany({
      where: { mealPlanId },
    })

    // 新しい順序でレシピを作成
    const newRecipes = await Promise.all(
      reorderedRecipes.map(async (recipe: { savedRecipeId: string }, index: number) => {
        return prisma.mealPlanRecipe.create({
          data: {
            mealPlanId,
            savedRecipeId: recipe.savedRecipeId,
            dayOfWeek: Math.floor(index / 1) + 1, // 1日1レシピとして計算
            mealType: 'dinner',
          },
          include: {
            savedRecipe: true,
          },
        })
      })
    )

    // 更新された献立を返す
    const updatedMealPlan = await prisma.mealPlan.findFirst({
      where: { id: mealPlanId },
      include: {
        recipes: {
          include: {
            savedRecipe: true,
          },
          orderBy: {
            dayOfWeek: 'asc'
          }
        },
      },
    })

    return NextResponse.json(updatedMealPlan)
  } catch (error) {
    console.error('Failed to update meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to update meal plan' },
      { status: 500 }
    )
  }
}

// 献立からレシピを削除
export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mealPlanRecipeId = searchParams.get('recipeId')

    if (!mealPlanRecipeId) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 })
    }

    // 献立レシピの所有者確認
    const mealPlanRecipe = await prisma.mealPlanRecipe.findFirst({
      where: {
        id: mealPlanRecipeId,
        mealPlan: {
          userId: user.id,
        },
      },
    })

    if (!mealPlanRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // レシピを削除
    await prisma.mealPlanRecipe.delete({
      where: { id: mealPlanRecipeId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete recipe from meal plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe from meal plan' },
      { status: 500 }
    )
  }
} 