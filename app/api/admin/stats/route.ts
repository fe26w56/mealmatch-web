import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      )
    }

    // 今週の開始日（月曜日）を計算
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - daysToMonday)
    thisWeekStart.setHours(0, 0, 0, 0)

    // 統計情報を並行して取得
    const [
      totalUsers,
      totalRecipes,
      newUsersThisWeek,
      activeUsersThisWeek,
      totalSavedRecipes,
      savedRecipesWithShopName
    ] = await Promise.all([
      // 総ユーザー数
      prisma.user.count(),
      
      // 総レシピ数（SavedRecipeテーブルから）
      prisma.savedRecipe.count(),
      
      // 今週の新規ユーザー数
      prisma.user.count({
        where: {
          createdAt: {
            gte: thisWeekStart
          }
        }
      }),
      
      // 今週アクティブなユーザー数（今週レシピを保存したユーザー）
      prisma.user.count({
        where: {
          savedRecipes: {
            some: {
              createdAt: {
                gte: thisWeekStart
              }
            }
          }
        }
      }),
      
      // 保存レシピ総数
      prisma.savedRecipe.count(),
      
      // カテゴリ別統計のためのレシピデータ
      prisma.savedRecipe.findMany({
        select: {
          shopName: true,
          recipeDescription: true,
          recipeTitle: true
        }
      })
    ])

    // カテゴリ別レシピ数を計算
    const recipesByCategory: { [key: string]: number } = {}
    
    savedRecipesWithShopName.forEach(recipe => {
      // レシピタイトルや説明からカテゴリを推測
      const title = recipe.recipeTitle?.toLowerCase() || ''
      const description = recipe.recipeDescription?.toLowerCase() || ''
      const content = `${title} ${description}`
      
      let category = 'その他'
      
      if (content.includes('肉') || content.includes('鶏') || content.includes('豚') || content.includes('牛') || 
          content.includes('唐揚げ') || content.includes('ハンバーグ')) {
        category = 'お肉のおかず'
      } else if (content.includes('魚') || content.includes('サーモン') || content.includes('マグロ') || 
                 content.includes('ムニエル')) {
        category = '魚介のおかず'
      } else if (content.includes('野菜') || content.includes('サラダ') || content.includes('キャベツ') || 
                 content.includes('人参') || content.includes('炒め')) {
        category = '野菜のおかず'
      } else if (content.includes('ご飯') || content.includes('丼') || content.includes('親子丼') || 
                 content.includes('カレー')) {
        category = 'ご飯もの'
      } else if (content.includes('パスタ') || content.includes('グラタン') || content.includes('ミートソース')) {
        category = 'パスタ・グラタン'
      } else if (content.includes('スープ') || content.includes('汁')) {
        category = 'スープ・汁物'
      } else if (content.includes('デザート') || content.includes('ケーキ') || content.includes('スイーツ')) {
        category = 'デザート'
      }
      
      recipesByCategory[category] = (recipesByCategory[category] || 0) + 1
    })

    const stats = {
      totalUsers,
      totalRecipes,
      newUsersThisWeek,
      activeUsersThisWeek,
      totalSavedRecipes,
      recipesByCategory
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' }, 
      { status: 500 }
    )
  }
} 