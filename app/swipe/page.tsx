'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from 'react'
import { Clock, ChefHat, X, Heart, FileText } from 'lucide-react'
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

export default function SwipePage() {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // レシピデータを取得
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // 管理者レシピAPIから取得
        const response = await fetch('/api/recipes?limit=50&shuffle=true')
        if (response.ok) {
          const data = await response.json()
          setRecipes(data)
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  const currentRecipe = recipes[currentIndex]
  const remainingCount = recipes.length - currentIndex - 1

  const handleSwipe = async (liked: boolean) => {
    if (!currentRecipe) return

    try {
      // 管理者レシピを保存
      await fetch('/api/saved-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: currentRecipe.recipeId,
          recipeTitle: currentRecipe.recipeTitle,
          recipeUrl: currentRecipe.recipeUrl || '#',
          foodImageUrl: currentRecipe.foodImageUrl,
          recipeDescription: currentRecipe.recipeDescription,
          recipeMaterial: currentRecipe.recipeMaterial,
          recipeIndication: currentRecipe.recipeIndication,
          shopName: currentRecipe.shopName,
          liked,
        }),
      })

      if (liked) {
        toast({
          title: "❤️ いいね！",
          description: `${currentRecipe.recipeTitle}をお気に入りに追加しました`,
        })
      }

      // 次のレシピに移動
      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      console.error('Failed to save recipe:', error)
      toast({
        title: "エラー",
        description: "レシピの保存に失敗しました",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center justify-between h-16 px-4">
            <h1 className="text-xl font-bold text-green-600">レシピスワイプ</h1>
          </div>
        </header>
        <main className="flex-1 container px-4 py-6 flex flex-col items-center justify-center">
          <div className="text-center">読み込み中...</div>
        </main>
      </div>
    )
  }

  if (currentIndex >= recipes.length) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center justify-between h-16 px-4">
            <h1 className="text-xl font-bold text-green-600">レシピスワイプ</h1>
          </div>
        </header>
        <main className="flex-1 container px-4 py-6 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <ChefHat className="h-16 w-16 mx-auto text-green-600" />
            <h2 className="text-xl font-semibold">お疲れ様でした！</h2>
            <p className="text-gray-600">すべてのレシピをチェックしました</p>
            <Link href="/plan">
              <Button className="mt-4">
                献立を確認する
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-green-600">レシピスワイプ</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <FileText className="w-5 h-5" />
              <span className="sr-only">メモ</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="overflow-hidden mb-6 relative">
            <div className="aspect-[4/3] relative">
              {currentRecipe.foodImageUrl ? (
                <img
                  src={currentRecipe.foodImageUrl}
                  alt={currentRecipe.recipeTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ChefHat className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                <Heart className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <div className="text-white font-semibold text-lg">{currentRecipe.recipeTitle}</div>
                <div className="flex items-center text-white/80 text-sm mt-1">
                  {currentRecipe.recipeIndication && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {currentRecipe.recipeIndication}
                    </span>
                  )}
                  {currentRecipe.shopName && (
                    <span className="flex items-center ml-3">
                      by {currentRecipe.shopName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  {currentRecipe.recipeIndication ? '時短' : '料理'}
                </span>
                {currentRecipe.shopName && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {currentRecipe.shopName}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {currentRecipe.recipeDescription || '美味しいレシピです。ぜひお試しください！'}
              </p>
            </div>
          </Card>

          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => handleSwipe(false)}
            >
              <X className="w-6 h-6" />
              <span className="sr-only">いいえ</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50"
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              <FileText className="w-6 h-6" />
              <span className="sr-only">保留</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-50"
              onClick={() => handleSwipe(true)}
            >
              <Heart className="w-6 h-6" />
              <span className="sr-only">はい</span>
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            残り {remainingCount} レシピ
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t bg-white">
        <div className="grid grid-cols-4 h-16">
          <Link href="/" className="flex flex-col items-center justify-center text-gray-500">
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
          <Link href="/swipe" className="flex flex-col items-center justify-center text-green-600">
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
