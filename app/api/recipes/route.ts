import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const shuffle = searchParams.get('shuffle') === 'true'

    // 管理者ユーザーを取得
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@maalmatch.com'
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 500 })
    }

    // 管理者が作成したレシピのみを取得
    let recipes = await prisma.savedRecipe.findMany({
      where: {
        userId: adminUser.id
      },
      select: {
        id: true,
        recipeId: true,
        recipeTitle: true,
        recipeDescription: true,
        foodImageUrl: true,
        recipeIndication: true,
        recipeMaterial: true,
        recipeInstructions: true,
        recipeUrl: true,
        shopName: true,
        createdAt: true,
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // シャッフルが要求された場合
    if (shuffle) {
      recipes = recipes.sort(() => Math.random() - 0.5)
    }

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
} 