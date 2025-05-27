import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

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

    return NextResponse.json(savedRecipe)
  } catch (error) {
    console.error('Failed to save recipe:', error)
    return NextResponse.json(
      { error: 'Failed to save recipe' },
      { status: 500 }
    )
  }
} 