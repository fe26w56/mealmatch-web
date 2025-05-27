'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Tag } from "lucide-react"

interface UserDetail {
  id: string
  email: string
  name: string
  createdAt: string
  expenses: Array<{
    id: string
    amount: number
    description: string
    date: string
    category?: { name: string }
  }>
  incomes: Array<{
    id: string
    amount: number
    description: string
    date: string
    category?: { name: string }
  }>
  categories: Array<{
    id: string
    name: string
    type: string
  }>
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('ユーザーが見つかりません')
        } else {
          throw new Error('Failed to fetch user')
        }
        return
      }
      const data = await response.json()
      setUser(data)
    } catch (error) {
      setError('ユーザー情報の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => router.push('/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            ユーザー一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  const totalExpenses = user.expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalIncomes = user.incomes.reduce((sum, income) => sum + income.amount, 0)
  const balance = totalIncomes - totalExpenses

  return (
    <div className="container mx-auto py-8 px-4">
      {/* ヘッダー */}
      <div className="flex items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/users')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総収入</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ¥{totalIncomes.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.incomes.length}件の記録
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総支出</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ¥{totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.expenses.length}件の記録
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">収支</CardTitle>
            <Tag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ¥{balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.categories.length}個のカテゴリ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 詳細タブ */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expenses">支出一覧</TabsTrigger>
          <TabsTrigger value="incomes">収入一覧</TabsTrigger>
          <TabsTrigger value="categories">カテゴリ一覧</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>支出履歴</CardTitle>
              <CardDescription>
                すべての支出記録を表示しています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>説明</TableHead>
                      <TableHead>カテゴリ</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>
                          {new Date(expense.date).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          {expense.category && (
                            <Badge variant="outline">{expense.category.name}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          ¥{expense.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {user.expenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          支出記録がありません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomes">
          <Card>
            <CardHeader>
              <CardTitle>収入履歴</CardTitle>
              <CardDescription>
                すべての収入記録を表示しています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日付</TableHead>
                      <TableHead>説明</TableHead>
                      <TableHead>カテゴリ</TableHead>
                      <TableHead className="text-right">金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.incomes.map((income) => (
                      <TableRow key={income.id}>
                        <TableCell>
                          {new Date(income.date).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell>{income.description}</TableCell>
                        <TableCell>
                          {income.category && (
                            <Badge variant="outline">{income.category.name}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          ¥{income.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {user.incomes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          収入記録がありません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>カテゴリ一覧</CardTitle>
              <CardDescription>
                ユーザーが作成したカテゴリを表示しています
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>カテゴリ名</TableHead>
                      <TableHead>タイプ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={category.type === 'expense' ? 'destructive' : 'default'}
                          >
                            {category.type === 'expense' ? '支出' : '収入'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {user.categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                          カテゴリがありません
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 