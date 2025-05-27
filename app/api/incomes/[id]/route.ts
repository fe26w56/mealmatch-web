import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 特定の収入の取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const income = await prisma.income.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }

    return NextResponse.json(income)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 })
  }
}

// 収入の更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { amount, description, date, categoryId } = body

    const income = await prisma.income.update({
      where: { id: params.id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        description,
        date: date ? new Date(date) : undefined,
        categoryId,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(income)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update income' }, { status: 500 })
  }
}

// 収入の削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.income.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Income deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 })
  }
} 