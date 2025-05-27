import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// カテゴリー一覧の取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const categories = await prisma.category.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// 新規カテゴリーの作成
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, type, userId } = body

    if (!name || !type || !userId) {
      return NextResponse.json(
        { error: 'Name, type, and userId are required' },
        { status: 400 }
      )
    }

    if (type !== 'expense' && type !== 'income') {
      return NextResponse.json(
        { error: 'Type must be either "expense" or "income"' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
} 