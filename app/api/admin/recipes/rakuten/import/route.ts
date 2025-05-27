import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RakutenRecipe {
  recipeId: string
  recipeTitle: string
  recipeUrl: string
  foodImageUrl: string
  recipeDescription: string
  recipeMaterial: string[]
  recipeIndication: string
  recipeInstructions?: string
  categoryName: string
  nickname: string
  recipePublishday: string
  shop: number
  pickup: number
  rank: string
}

export async function POST(request: NextRequest) {
  try {
    // 管理者権限チェック
    const isAdminResult = await isAdmin(request)
    if (!isAdminResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipes }: { recipes: RakutenRecipe[] } = await request.json()

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return NextResponse.json({ error: 'Invalid recipes data' }, { status: 400 })
    }

    // 管理者ユーザーを取得
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@maalmatch.com'
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 500 })
    }

    // 既存のレシピIDをチェック（重複防止）
    const existingRecipeIds = await prisma.savedRecipe.findMany({
      where: {
        recipeId: {
          in: recipes.map((r: RakutenRecipe) => r.recipeId)
        }
      },
      select: { recipeId: true }
    })

    const existingIds = new Set(existingRecipeIds.map((r: { recipeId: string }) => r.recipeId))
    const newRecipes = recipes.filter((r: RakutenRecipe) => !existingIds.has(r.recipeId))

    if (newRecipes.length === 0) {
      return NextResponse.json({ 
        success: true, 
        imported: 0,
        skipped: recipes.length,
        message: 'All recipes already exist'
      })
    }

    // データベースに一括挿入
    const createdRecipes = await prisma.$transaction(
      newRecipes.map(recipe => 
        prisma.savedRecipe.create({
          data: {
            recipeId: recipe.recipeId,
            recipeTitle: recipe.recipeTitle,
            recipeUrl: recipe.recipeUrl,
            foodImageUrl: recipe.foodImageUrl,
            recipeDescription: recipe.recipeDescription,
            recipeMaterial: JSON.stringify(recipe.recipeMaterial),
            recipeIndication: recipe.recipeIndication,
            recipeInstructions: recipe.recipeInstructions || '',
            shopName: recipe.nickname || 'Rakuten Recipe',
            userId: adminUser.id,
            liked: true
          }
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      imported: createdRecipes.length,
      skipped: recipes.length - newRecipes.length,
      message: `${createdRecipes.length}件のレシピをインポートしました`
    })

  } catch (error) {
    console.error('Rakuten recipe import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 