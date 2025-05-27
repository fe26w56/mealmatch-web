import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { deleteSession, deleteSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const cookiesStore = await cookies()
    const token = cookiesStore.get('session-token')?.value

    if (token) {
      // セッションを削除
      await deleteSession(token)
    }

    // セッションクッキーを削除
    await deleteSessionCookie()

    return NextResponse.json({ message: 'Logout successful' })

  } catch (error) {
    console.error('Error during logout:', error)
    // エラーが発生してもクッキーは削除する
    await deleteSessionCookie()
    return NextResponse.json({ message: 'Logout successful' })
  }
} 