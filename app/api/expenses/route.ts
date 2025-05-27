import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 支出一覧の取得（ページネーション、検索、フィルタリング機能付き）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const skip = (page - 1) * limit

    // 検索条件の構築
    const where = {
      userId,
      ...(search && {
        OR: [
          { description: { contains: search } },
          { category: { name: { contains: search } } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(startDate && { date: { gte: new Date(startDate) } }),
      ...(endDate && { date: { lte: new Date(endDate) } }),
      ...(minAmount && { amount: { gte: parseFloat(minAmount) } }),
      ...(maxAmount && { amount: { lte: parseFloat(maxAmount) } }),
    }

    // 総件数の取得
    const total = await prisma.expense.count({ where })

    // 支出データの取得
    const expenses = await prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
      skip,
      take: limit,
    })

    return NextResponse.json({
      expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
  }
}

// 新規支出の作成
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, description, date, userId, categoryId } = body

    if (!amount || !userId || !categoryId) {
      return NextResponse.json(
        { error: 'Amount, userId, and categoryId are required' },
        { status: 400 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
        userId,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
} 