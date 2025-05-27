import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 管理者権限チェック
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Admin access required' }, 
        { status: 403 }
      )
    }

    // レシピが存在するかチェック
    const recipe = await prisma.savedRecipe.findUnique({
      where: { id: params.id }
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' }, 
        { status: 404 }
      )
    }

    // レシピを削除
    await prisma.savedRecipe.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'Recipe deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Failed to delete recipe' }, 
      { status: 500 }
    )
  }
} 