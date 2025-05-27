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

    // 管理者ユーザーは削除できない
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      )
    }

    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin user' }, 
        { status: 400 }
      )
    }

    // ユーザーを削除（カスケード削除により関連データも削除される）
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'User deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' }, 
      { status: 500 }
    )
  }
} 