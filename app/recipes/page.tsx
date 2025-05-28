'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useAuth } from '../contexts/AuthContext'
import { RecipeCard } from '@/components/RecipeCard'
import { useToast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Home,
  SlidersHorizontal,
  ChefHat,
  Heart,
  Clock,
  ExternalLink,
  Plus
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminRecipe, RecipesResponse } from '@/lib/types'

export default function RecipesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [recipes, setRecipes] = useState<AdminRecipe[]>([])
  const [recipesLoading, setRecipesLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(12)
  const [selectedRecipe, setSelectedRecipe] = useState<AdminRecipe | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isAddingToMealPlan, setIsAddingToMealPlan] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // レシピデータを取得
  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) return
      
      setRecipesLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          sort: sortBy,
        })
        
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }

        const response = await fetch(`/api/recipes?${params}`)
        if (response.ok) {
          const data: RecipesResponse = await response.json()
          setRecipes(data.recipes)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error)
      } finally {
        setRecipesLoading(false)
      }
    }

    fetchRecipes()
  }, [user, currentPage, limit, sortBy, searchQuery])

  // URL更新
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (currentPage !== 1) params.set('page', currentPage.toString())
    
    const newUrl = params.toString() ? `/recipes?${params}` : '/recipes'
    window.history.replaceState({}, '', newUrl)
  }, [searchQuery, sortBy, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRecipeClick = (recipe: AdminRecipe) => {
    setSelectedRecipe(recipe)
    setIsDetailDialogOpen(true)
  }

  const handleAddToMealPlan = async () => {
    if (!selectedRecipe) return

    setIsAddingToMealPlan(true)
    try {
      // レシピを保存（liked: trueで保存）
      const response = await fetch('/api/saved-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: selectedRecipe.recipeId,
          recipeTitle: selectedRecipe.recipeTitle,
          recipeUrl: selectedRecipe.recipeUrl || '#',
          foodImageUrl: selectedRecipe.foodImageUrl,
          recipeDescription: selectedRecipe.recipeDescription,
          recipeMaterial: selectedRecipe.recipeMaterial,
          recipeIndication: selectedRecipe.recipeIndication,
          shopName: selectedRecipe.shopName,
          liked: true, // 献立に追加するのでlikedをtrueに
        }),
      })

      if (response.ok) {
        toast({
          title: "献立に追加しました！",
          description: `${selectedRecipe.recipeTitle}を今週の献立に追加しました`,
        })
        setIsDetailDialogOpen(false)
      } else {
        throw new Error('Failed to save recipe')
      }
    } catch (error) {
      console.error('Failed to add recipe to meal plan:', error)
      toast({
        title: "エラー",
        description: "献立への追加に失敗しました",
        variant: "destructive",
      })
    } finally {
      setIsAddingToMealPlan(false)
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
    return null
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
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        {/* 検索・フィルター */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="レシピを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">
              検索
            </Button>
          </form>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="並び順" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">新着順</SelectItem>
                  <SelectItem value="oldest">古い順</SelectItem>
                  <SelectItem value="title">タイトル順</SelectItem>
                  <SelectItem value="shop">ショップ名順</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-600">
              {total}件のレシピ
            </div>
          </div>
        </div>

        {/* レシピ一覧 */}
        {recipesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : recipes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-gray-500">
              {searchQuery ? (
                <>
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">検索結果が見つかりません</h3>
                  <p>「{searchQuery}」に一致するレシピがありませんでした。</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('')
                      setCurrentPage(1)
                    }}
                  >
                    検索をクリア
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">レシピがありません</h3>
                  <p>まだレシピが登録されていません。</p>
                </>
              )}
            </div>
          </Card>
        ) : (
          <>
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
            }>
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.recipeId}
                  recipe={{
                    id: recipe.id,
                    recipeId: recipe.recipeId,
                    recipeTitle: recipe.recipeTitle,
                    recipeDescription: recipe.recipeDescription,
                    foodImageUrl: recipe.foodImageUrl,
                    recipeIndication: recipe.recipeIndication,
                    recipeMaterial: recipe.recipeMaterial,
                    recipeInstructions: recipe.recipeInstructions,
                    recipeUrl: recipe.recipeUrl,
                    shopName: recipe.shopName,
                    createdAt: recipe.createdAt
                  }}
                  onClick={() => handleRecipeClick(recipe)}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  前へ
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  次へ
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
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
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
            </svg>
            <span className="text-xs mt-1">マッチ</span>
          </Link>
          <Link href="/recipes" className="flex flex-col items-center justify-center text-green-600">
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

      {selectedRecipe && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedRecipe.recipeTitle}
              </DialogTitle>
              <DialogDescription>
                {selectedRecipe.recipeDescription}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* レシピ画像 */}
              {selectedRecipe.foodImageUrl && (
                <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedRecipe.foodImageUrl}
                    alt={selectedRecipe.recipeTitle}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://via.placeholder.com/400x200/f0f0f0/999999?text=${encodeURIComponent(selectedRecipe.recipeTitle.charAt(0))}`
                    }}
                  />
                </div>
              )}
              
              {/* レシピ情報 */}
              <div className="grid grid-cols-2 gap-4">
                {selectedRecipe.recipeIndication && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">調理時間</Label>
                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedRecipe.recipeIndication}
                    </p>
                  </div>
                )}
                
                {selectedRecipe.shopName && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">レシピ提供者</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedRecipe.shopName}
                    </p>
                  </div>
                )}
              </div>
              
              {/* 材料 */}
              {selectedRecipe.recipeMaterial && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">材料</Label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {(() => {
                      try {
                        const materials = typeof selectedRecipe.recipeMaterial === 'string' 
                          ? JSON.parse(selectedRecipe.recipeMaterial)
                          : selectedRecipe.recipeMaterial
                        
                        if (Array.isArray(materials)) {
                          return (
                            <ul className="space-y-1">
                              {materials.map((material, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start">
                                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {material}
                                </li>
                              ))}
                            </ul>
                          )
                        } else {
                          return <p className="text-sm text-gray-700">{selectedRecipe.recipeMaterial}</p>
                        }
                      } catch (e) {
                        return <p className="text-sm text-gray-700">{selectedRecipe.recipeMaterial}</p>
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* 作り方 */}
              {selectedRecipe.recipeInstructions && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">作り方</Label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedRecipe.recipeInstructions}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex gap-2">
              {selectedRecipe.recipeUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedRecipe.recipeUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  詳細レシピを見る
                </Button>
              )}
              <Button 
                onClick={handleAddToMealPlan}
                disabled={isAddingToMealPlan}
                className="flex items-center gap-2"
              >
                {isAddingToMealPlan ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isAddingToMealPlan ? '追加中...' : '献立に追加'}
              </Button>
              <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                閉じる
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 