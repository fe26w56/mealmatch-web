import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ユーザー一覧の取得
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            expenses: true,
            incomes: true,
            categories: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// 新しいユーザーの作成
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name } = body

    // バリデーション
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' }, 
        { status: 400 }
      )
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      )
    }

    // 既存ユーザーの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' }, 
        { status: 409 }
      )
    }

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        name: name.trim(),
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    
    // Prismaのユニーク制約エラーをキャッチ
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'User with this email already exists' }, 
        { status: 409 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
} 