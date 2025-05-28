import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

// レシピの曜日を変更
export async function PUT(request: Request) {
  try {
    const user = await getSessionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipeId, newDayOfWeek } = await request.json()

    // レシピが存在し、ユーザーのものかチェック
    const existingRecipe = await prisma.mealPlanRecipe.findFirst({
      where: {
        id: recipeId,
        mealPlan: {
          userId: user.id
        }
      },
      include: {
        mealPlan: true
      }
    })

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // レシピの曜日を更新
    const updatedRecipe = await prisma.mealPlanRecipe.update({
      where: { id: recipeId },
      data: {
        dayOfWeek: newDayOfWeek,
      },
      include: {
        savedRecipe: true,
      },
    })

    return NextResponse.json(updatedRecipe)
  } catch (error) {
    console.error('Failed to move recipe:', error)
    return NextResponse.json(
      { error: 'Failed to move recipe' },
      { status: 500 }
    )
  }
} 