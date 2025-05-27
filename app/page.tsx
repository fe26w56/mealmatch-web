'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from './contexts/AuthContext'
import { RecipeCard } from '@/components/RecipeCard'
import { Loader2, LogOut, User, Clock, ChefHat } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

interface AdminRecipe {
  id: string
  recipeId: string
  recipeTitle: string
  recipeDescription?: string
  foodImageUrl?: string
  recipeIndication?: string
  recipeMaterial?: string
  recipeInstructions?: string
  recipeUrl?: string
  shopName?: string
  createdAt: string
}

export default function Home() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [favoriteRecipes, setFavoriteRecipes] = useState<AdminRecipe[]>([])
  const [recommendedRecipes, setRecommendedRecipes] = useState<AdminRecipe[]>([])
  const [recipesLoading, setRecipesLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // レシピデータを取得
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // 管理者レシピAPIから取得
        const response = await fetch('/api/recipes?limit=30&shuffle=true')
        if (response.ok) {
          const recipes = await response.json()
          // シャッフルされたレシピから異なる部分を取得
          setFavoriteRecipes(recipes.slice(0, 4))
          setRecommendedRecipes(recipes.slice(4, 6))
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error)
      } finally {
        setRecipesLoading(false)
      }
    }

    if (user) {
      fetchRecipes()
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "ログアウト",
        description: "正常にログアウトしました",
      })
      router.push('/auth/login')
    } catch (error) {
      toast({
        title: "エラー",
        description: "ログアウトに失敗しました",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // リダイレクト中
  }

  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : user.email[0].toUpperCase()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-green-600">MealMatch</h1>
          <div className="flex items-center space-x-2">
            {user.role === 'admin' && (
              <Link href="/users">
                <Button variant="outline" size="sm">
                  管理者ダッシュボード
                </Button>
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name || 'ユーザー'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <div className="mb-6">
          <div className="bg-white rounded-lg p-6 border mb-6">
            <h2 className="text-lg font-semibold mb-2">
              ようこそ、{user.name || 'ユーザー'}さん！
            </h2>
            <p className="text-gray-600">
              MealMatchで素敵な食事プランを作成しましょう。
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">人気のレシピ</h2>
            <Link href="/swipe">
              <Button variant="outline" size="sm">
                もっと見る
              </Button>
            </Link>
          </div>
          {recipesLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.recipeId}
                  recipe={{
                    id: recipe.id,
                    recipeId: recipe.recipeId,
                    recipeTitle: recipe.recipeTitle,
                    recipeDescription: recipe.recipeDescription,
                    foodImageUrl: recipe.foodImageUrl,
                    recipeIndication: recipe.recipeIndication,
                    shopName: recipe.shopName
                  }}
                  onClick={() => window.location.href = `/recipe/${recipe.recipeId}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">今週の献立</h2>
            <Link href="/plan">
              <Button variant="outline" size="sm">
                詳細
              </Button>
            </Link>
          </div>
          <Card className="p-4">
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-medium mb-2">
              <div>月</div>
              <div>火</div>
              <div>水</div>
              <div>木</div>
              <div>金</div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-xs p-1"
                >
                  料理{i}
                </div>
              ))}
            </div>
            <Link href="/plan">
              <Button className="w-full mt-4" size="sm">
                献立を見る
              </Button>
            </Link>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">おすすめレシピ</h2>
            <Link href="/swipe">
              <Button variant="ghost" size="sm">
                更新
              </Button>
            </Link>
          </div>
          {recipesLoading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {recommendedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.recipeId}
                  recipe={{
                    id: recipe.id,
                    recipeId: recipe.recipeId,
                    recipeTitle: recipe.recipeTitle,
                    recipeDescription: recipe.recipeDescription || 'おいしいレシピです',
                    foodImageUrl: recipe.foodImageUrl,
                    recipeIndication: recipe.recipeIndication,
                    shopName: recipe.shopName
                  }}
                  onClick={() => window.location.href = `/recipe/${recipe.recipeId}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 border-t bg-white">
        <div className="grid grid-cols-4 h-16">
          <Link href="/" className="flex flex-col items-center justify-center text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="text-xs mt-1">ホーム</span>
          </Link>
          <Link href="/swipe" className="flex flex-col items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m17 14 3 3 3-3"></path>
              <path d="M22 17v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"></path>
              <path d="m11 8 3-3 3 3"></path>
              <path d="M14 5v9"></path>
            </svg>
            <span className="text-xs mt-1">スワイプ</span>
          </Link>
          <Link href="/plan" className="flex flex-col items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="text-xs mt-1">献立</span>
          </Link>
          <Link href="/settings" className="flex flex-col items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span className="text-xs mt-1">設定</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}
