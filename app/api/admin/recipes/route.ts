import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// レシピ一覧取得
export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      )
    }

    const recipes = await prisma.savedRecipe.findMany({
      select: {
        id: true,
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
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // 最新50件
    })

    return NextResponse.json(recipes)
  } catch (error) {
    console.error('Error fetching recipes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipes' }, 
      { status: 500 }
    )
  }
}

// レシピ追加
export async function POST(request: NextRequest) {
  try {
    // 管理者権限チェック
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      )
    }

    const body = await request.json()
    const { recipeTitle, recipeDescription, foodImageUrl, recipeIndication, recipeMaterial, recipeInstructions } = body

    // 管理者ユーザーを取得（環境変数のadminEmailを使用）
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@maalmatch.com'
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' }, 
        { status: 500 }
      )
    }

    // レシピIDを生成（ユニークなID）
    const recipeId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const recipe = await prisma.savedRecipe.create({
      data: {
        recipeId,
        recipeTitle,
        recipeDescription: recipeDescription || '',
        foodImageUrl: foodImageUrl || '',
        recipeIndication: recipeIndication || '',
        recipeMaterial: recipeMaterial || '[]',
        recipeInstructions: recipeInstructions || '',
        recipeUrl: `#admin-recipe-${recipeId}`,
        userId: adminUser.id,
        liked: true
      }
    })

    return NextResponse.json(recipe)
  } catch (error) {
    console.error('Error creating recipe:', error)
    return NextResponse.json(
      { error: 'Failed to create recipe' }, 
      { status: 500 }
    )
  }
} 