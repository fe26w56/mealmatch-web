'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect, useRef } from 'react'
import { Clock, ChefHat, X, Heart, FileText, Loader2 } from 'lucide-react'
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [likedCount, setLikedCount] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)
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
          description: `${currentRecipe.recipeTitle}を献立に追加しました`,
        })
        setLikedCount(prev => prev + 1)
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

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ x: 0, y: 0 })
  }

  // ドラッグ中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    
    setDragOffset({ x: deltaX, y: deltaY })
  }

  // ドラッグ終了
  const handleMouseUp = () => {
    if (!isDragging) return
    
    const threshold = 100 // スワイプの閾値
    
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        // 右にスワイプ = いいね
        handleSwipe(true)
      } else {
        // 左にスワイプ = パス
        handleSwipe(false)
      }
    }
    
    // リセット
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // タッチイベント対応
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setDragOffset({ x: 0, y: 0 })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    
    const touch = e.touches[0]
    const deltaX = touch.clientX - dragStart.x
    const deltaY = touch.clientY - dragStart.y
    
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 100
    
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        handleSwipe(true)
      } else {
        handleSwipe(false)
      }
    }
    
    setIsDragging(false)
    setDragOffset({ x: 0, y: 0 })
  }

  // カードのスタイル計算
  const getCardStyle = () => {
    const rotation = dragOffset.x * 0.1 // 回転角度
    const opacity = Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300)
    
    return {
      transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.1}px) rotate(${rotation}deg)`,
      opacity,
      transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
      cursor: isDragging ? 'grabbing' : 'grab',
    }
  }

  // カラーオーバーレイの計算
  const getColorOverlay = () => {
    if (Math.abs(dragOffset.x) < 30) return null
    
    const intensity = Math.min(0.4, Math.abs(dragOffset.x) / 200)
    
    if (dragOffset.x > 0) {
      // 右ドラッグ = 緑のオーバーレイ
      return (
        <div 
          className="absolute inset-0 bg-green-500 pointer-events-none z-10"
          style={{ opacity: intensity }}
        />
      )
    } else {
      // 左ドラッグ = 赤のオーバーレイ
      return (
        <div 
          className="absolute inset-0 bg-red-500 pointer-events-none z-10"
          style={{ opacity: intensity }}
        />
      )
    }
  }

  // スワイプインジケーターの表示
  const getSwipeIndicator = () => {
    if (Math.abs(dragOffset.x) < 50) return null
    
    if (dragOffset.x > 0) {
      return (
        <div className="absolute top-4 right-4 bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold opacity-90 z-20 shadow-lg">
          LIKE ❤️
        </div>
      )
    } else {
      return (
        <div className="absolute top-4 left-4 bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold opacity-90 z-20 shadow-lg">
          PASS ❌
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="MealMatch" 
                className="h-8 w-8"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (target.src.includes('.svg')) {
                    target.src = '/logo.png'
                  } else {
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.text-logo')) {
                      const textLogo = document.createElement('span')
                      textLogo.className = 'text-xl font-bold text-green-600 text-logo'
                      textLogo.textContent = 'MealMatch'
                      parent.appendChild(textLogo)
                    }
                  }
                }}
              />
              <h1 className="text-xl font-bold text-green-600">MealMatch</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 container px-4 py-6 flex flex-col items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>あなたにぴったりのレシピを探しています...</p>
          </div>
        </main>
      </div>
    )
  }

  if (currentIndex >= recipes.length) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="MealMatch" 
                className="h-8 w-8"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (target.src.includes('.svg')) {
                    target.src = '/logo.png'
                  } else {
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent && !parent.querySelector('.text-logo')) {
                      const textLogo = document.createElement('span')
                      textLogo.className = 'text-xl font-bold text-green-600 text-logo'
                      textLogo.textContent = 'MealMatch'
                      parent.appendChild(textLogo)
                    }
                  }
                }}
              />
              <h1 className="text-xl font-bold text-green-600">MealMatch</h1>
            </div>
          </div>
        </header>
        <main className="flex-1 container px-4 py-6 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
              <Heart className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">マッチング完了！</h2>
            <div className="space-y-2">
              <p className="text-gray-600">お疲れ様でした！</p>
              {likedCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">
                    ❤️ {likedCount}個のレシピをお気に入りに追加しました
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    これらのレシピが自動的に今週の献立に追加されます
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3 pt-4">
              <Link href="/plan">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <ChefHat className="h-4 w-4 mr-2" />
                  今週の献立を確認する
                </Button>
              </Link>
              <Link href="/recipes">
                <Button variant="outline" className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  お気に入りレシピを見る
                </Button>
              </Link>
              <Link href="/swipe">
                <Button variant="ghost" className="w-full">
                  もっとレシピを探す
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="MealMatch" 
              className="h-8 w-8"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                if (target.src.includes('.svg')) {
                  target.src = '/logo.png'
                } else {
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent && !parent.querySelector('.text-logo')) {
                    const textLogo = document.createElement('span')
                    textLogo.className = 'text-xl font-bold text-green-600 text-logo'
                    textLogo.textContent = 'MealMatch'
                    parent.appendChild(textLogo)
                  }
                }
              }}
            />
            <h1 className="text-xl font-bold text-green-600">MealMatch</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              残り {remainingCount}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          {/* プログレスバー */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>進行状況</span>
              <span>{Math.round(((recipes.length - remainingCount - 1) / recipes.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((recipes.length - remainingCount - 1) / recipes.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* ドラッグ可能なカード */}
          <div className="relative mb-6">
            <Card 
              ref={cardRef}
              className="overflow-hidden relative select-none"
              style={getCardStyle()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {getColorOverlay()}
              {getSwipeIndicator()}
              
              <div className="aspect-[4/3] relative">
                {currentRecipe.foodImageUrl ? (
                  <img
                    src={currentRecipe.foodImageUrl}
                    alt={currentRecipe.recipeTitle}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 z-30">
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
              <div className="p-4 relative z-30">
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
          </div>

          {/* 操作説明 */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              カードをドラッグするか、ボタンで選択してください
            </p>
          </div>

          {/* マッチングアクション */}
          <div className="flex justify-center space-x-6">
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full border-2 border-red-500 text-red-500 hover:bg-red-50"
              onClick={() => handleSwipe(false)}
            >
              <X className="w-8 h-8" />
              <span className="sr-only">パス</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50"
              onClick={() => setCurrentIndex(prev => prev + 1)}
            >
              <FileText className="w-8 h-8" />
              <span className="sr-only">後で</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-16 w-16 rounded-full border-2 border-green-500 text-green-500 hover:bg-green-50"
              onClick={() => handleSwipe(true)}
            >
              <Heart className="w-8 h-8" />
              <span className="sr-only">いいね</span>
            </Button>
          </div>

          <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-500">
            <span>パス</span>
            <span>後で</span>
            <span>いいね</span>
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
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
            </svg>
            <span className="text-xs mt-1">マッチ</span>
          </Link>
          <Link href="/recipes" className="flex flex-col items-center justify-center text-gray-500">
            <ChefHat className="w-5 h-5" />
            <span className="text-xs mt-1">検索</span>
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
        </div>
      </footer>
    </div>
  )
}
