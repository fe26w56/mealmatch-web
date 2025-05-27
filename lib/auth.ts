import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  role: string
}

// パスワードをハッシュ化
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// パスワードを検証
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':')
  const hashToVerify = scryptSync(password, salt, 64)
  const hashBuffer = Buffer.from(hash, 'hex')
  return timingSafeEqual(hashBuffer, hashToVerify)
}

// セッショントークンを生成
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

// セッションを作成
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30日後

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

// セッションを検証
export async function validateSession(token: string): Promise<AuthUser | null> {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }
}

// セッションを削除
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => {})
}

// リクエストからユーザーを取得
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('session-token')?.value

  if (!token) {
    return null
  }

  return await validateSession(token)
}

// クッキーにセッションを設定
export async function setSessionCookie(token: string) {
  const cookiesStore = await cookies()
  cookiesStore.set('session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30日
    path: '/',
  })
}

// セッションクッキーを削除
export async function deleteSessionCookie() {
  const cookiesStore = await cookies()
  cookiesStore.delete('session-token')
}

// リクエストからセッションユーザーを取得（API用）
export async function getSessionUser(request: Request): Promise<AuthUser | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) {
    return null
  }

  const cookies = new Map(
    cookieHeader.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=')
      return [key, value]
    })
  )

  const token = cookies.get('session-token')
  if (!token) {
    return null
  }

  return await validateSession(token)
}

// admin権限をチェック
export async function isAdmin(request: Request): Promise<boolean> {
  const user = await getSessionUser(request)
  return user?.role === 'admin'
}

// admin権限をチェック（クライアントサイド用）
export async function getCurrentUserWithRole(): Promise<AuthUser | null> {
  const cookiesStore = await cookies()
  const token = cookiesStore.get('session-token')?.value

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } })
    }
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  }
} 