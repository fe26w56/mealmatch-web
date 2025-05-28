import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'
    const shuffle = searchParams.get('shuffle') === 'true'

    // 管理者ユーザーを取得
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@maalmatch.com'
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 500 })
    }

    // 検索条件を構築
    const where: any = {
      userId: adminUser.id
    }

    if (search && search.trim()) {
      where.OR = [
        {
          recipeTitle: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        },
        {
          recipeDescription: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        },
        {
          shopName: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        },
        {
          recipeMaterial: {
            contains: search.trim(),
            mode: 'insensitive'
          }
        }
      ]
    }

    // ソート条件を構築
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'title':
        orderBy = { recipeTitle: 'asc' }
        break
      case 'shop':
        orderBy = { shopName: 'asc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    // 総数を取得
    const total = await prisma.savedRecipe.count({ where })

    // ページネーション計算
    const offset = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)

    // レシピを取得
    let recipes = await prisma.savedRecipe.findMany({
      where,
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
      orderBy: shuffle ? undefined : orderBy
    })

    // シャッフルが要求された場合
    if (shuffle) {
      recipes = recipes.sort(() => Math.random() - 0.5)
    }

    // レガシーサポート: limitとoffsetパラメータの場合は古い形式で返す
    if (searchParams.has('offset') || (!searchParams.has('page') && !searchParams.has('search') && !searchParams.has('sort'))) {
      return NextResponse.json(recipes)
    }

    // 新しい形式でレスポンス
    return NextResponse.json({
      recipes,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    })
  } catch (error) {
    console.error('Failed to fetch recipes:', error)
    return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 })
  }
} 