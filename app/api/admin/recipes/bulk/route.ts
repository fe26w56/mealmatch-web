import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface BulkRecipe {
  recipeTitle: string
  recipeDescription: string
  foodImageUrl: string
  recipeIndication: string
  recipeMaterial: string[]
  recipeInstructions?: string
}

export async function POST(request: NextRequest) {
  try {
    // 管理者権限チェック
    const isAdminResult = await isAdmin(request)
    if (!isAdminResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { recipes }: { recipes: BulkRecipe[] } = await request.json()

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return NextResponse.json({ error: 'Invalid recipes data' }, { status: 400 })
    }

    // バリデーション
    const validRecipes = recipes.filter(recipe => 
      recipe.recipeTitle && 
      recipe.recipeDescription && 
      recipe.recipeIndication &&
      Array.isArray(recipe.recipeMaterial)
    )

    if (validRecipes.length === 0) {
      return NextResponse.json({ error: 'No valid recipes found' }, { status: 400 })
    }

    // 管理者ユーザーを取得
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@maalmatch.com'
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 500 })
    }

    // データベースに一括挿入
    const createdRecipes = await prisma.$transaction(
      validRecipes.map((recipe, index) => 
        prisma.savedRecipe.create({
          data: {
            recipeId: `bulk-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            recipeTitle: recipe.recipeTitle,
            recipeUrl: `#bulk-recipe-${Date.now()}-${index}`,
            foodImageUrl: recipe.foodImageUrl || '',
            recipeDescription: recipe.recipeDescription,
            recipeMaterial: JSON.stringify(recipe.recipeMaterial),
            recipeIndication: recipe.recipeIndication,
            recipeInstructions: recipe.recipeInstructions || '',
            shopName: 'Admin Bulk Import',
            userId: adminUser.id,
            liked: true
          }
        })
      )
    )

    return NextResponse.json({ 
      success: true, 
      imported: createdRecipes.length,
      skipped: recipes.length - validRecipes.length
    })

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 