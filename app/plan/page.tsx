'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from 'react'
import { ChefHat, Clock, Users, Loader2, GripVertical, Plus, Trash2, Eye, ExternalLink } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SavedRecipe {
  id: string
  recipeId: string
  recipeTitle: string
  recipeUrl: string
  foodImageUrl?: string
  recipeDescription?: string
  recipeMaterial?: string
  recipeIndication?: string
  shopName?: string
}

interface MealPlanRecipe {
  id: string
  dayOfWeek: number
  mealType: string
  savedRecipe: SavedRecipe
  savedRecipeId: string
}

interface MealPlan {
  id: string
  weekStart: string
  recipes: MealPlanRecipe[]
}

const dayNames = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日']

// ドラッグ可能なレシピアイテムコンポーネント
function SortableRecipeItem({ recipe, dayIndex, onRemove, onViewDetails }: { 
  recipe: MealPlanRecipe, 
  dayIndex: number,
  onRemove: (recipeId: string) => void,
  onViewDetails: (recipe: SavedRecipe) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: recipe.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 shadow-sm ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
          {recipe.savedRecipe.foodImageUrl ? (
            <img
              src={recipe.savedRecipe.foodImageUrl}
              alt={recipe.savedRecipe.recipeTitle}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://via.placeholder.com/64x64/f0f0f0/999999?text=${encodeURIComponent(recipe.savedRecipe.recipeTitle.charAt(0))}`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm truncate">{recipe.savedRecipe.recipeTitle}</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {dayNames[dayIndex]}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
            {recipe.savedRecipe.recipeDescription || '美味しいレシピです'}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {recipe.savedRecipe.recipeIndication && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {recipe.savedRecipe.recipeIndication}
              </span>
            )}
            {recipe.savedRecipe.shopName && (
              <span className="truncate">
                by {recipe.savedRecipe.shopName}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(recipe.savedRecipe)}
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(recipe.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PlanPage() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 材料の分類とパース
  interface ParsedIngredient {
    name: string
    amount: string
    unit: string
    category: string
  }

  const parseIngredient = (ingredient: string): ParsedIngredient => {
    // 基本的な分量パターンをマッチ
    const amountMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*([^\d\s]+)?/)
    
    let name = ingredient
    let amount = ''
    let unit = ''
    
    if (amountMatch) {
      amount = amountMatch[1]
      unit = amountMatch[2] || ''
      name = ingredient.replace(amountMatch[0], '').trim()
    }
    
    // 名前から数字と単位を除去
    name = name.replace(/^\d+(?:\.\d+)?\s*[^\d\s]*\s*/, '').trim()
    
    // カテゴリ分類
    const category = categorizeIngredient(name)
    
    return { name, amount, unit, category }
  }

  const categorizeIngredient = (name: string): string => {
    const categories = {
      '野菜': ['トマト', '玉ねぎ', 'にんじん', 'じゃがいも', 'キャベツ', 'レタス', 'きゅうり', 'なす', 'ピーマン', 'もやし', 'ほうれん草', 'ブロッコリー', 'アスパラ', 'かぼちゃ', 'にんにく', 'しょうが', 'ねぎ', '白菜', '大根'],
      '肉類': ['牛肉', '豚肉', '鶏肉', 'ひき肉', 'バラ肉', 'もも肉', '胸肉', 'ささみ', 'ベーコン', 'ハム', 'ソーセージ'],
      '魚介類': ['鮭', 'まぐろ', 'いわし', 'さば', 'あじ', 'えび', 'いか', 'たこ', 'ホタテ', 'あさり', 'しじみ'],
      '卵・乳製品': ['卵', '牛乳', 'チーズ', 'バター', 'ヨーグルト', '生クリーム'],
      '穀物': ['米', 'パン', 'うどん', 'そば', 'パスタ', '小麦粉', 'パン粉'],
      '調味料': ['塩', 'しょうゆ', 'みそ', '砂糖', '酢', '油', 'みりん', '酒', 'だし', 'コショウ', 'ソース', 'ケチャップ', 'マヨネーズ'],
      'その他': []
    }

    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => name.includes(item))) {
        return category
      }
    }
    
    return 'その他'
  }

  const combineIngredients = (ingredients: ParsedIngredient[]): ParsedIngredient[] => {
    const combined = new Map<string, ParsedIngredient>()
    
    ingredients.forEach(ingredient => {
      const key = `${ingredient.name}-${ingredient.unit}`
      
      if (combined.has(key)) {
        const existing = combined.get(key)!
        const existingAmount = parseFloat(existing.amount) || 0
        const newAmount = parseFloat(ingredient.amount) || 0
        
        combined.set(key, {
          ...existing,
          amount: (existingAmount + newAmount).toString()
        })
      } else {
        combined.set(key, ingredient)
      }
    })
    
    return Array.from(combined.values())
  }

  // 献立データを取得
  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const response = await fetch('/api/meal-plans')
        if (response.ok) {
          const data = await response.json()
          setMealPlan(data)
        } else {
          console.error('Failed to fetch meal plan')
        }
      } catch (error) {
        console.error('Failed to fetch meal plan:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlan()
  }, [])

  // ドラッグ終了時の処理
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !mealPlan) return

    const oldIndex = mealPlan.recipes.findIndex(recipe => recipe.id === active.id)
    const newIndex = mealPlan.recipes.findIndex(recipe => recipe.id === over.id)

    if (oldIndex !== newIndex) {
      const newRecipes = arrayMove(mealPlan.recipes, oldIndex, newIndex)
      
      // UIを即座に更新
      setMealPlan({
        ...mealPlan,
        recipes: newRecipes
      })

      try {
        // サーバーに並び替えを送信
        const response = await fetch('/api/meal-plans', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mealPlanId: mealPlan.id,
            reorderedRecipes: newRecipes.map(recipe => ({
              savedRecipeId: recipe.savedRecipeId
            }))
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update meal plan order')
        }

        toast({
          title: "献立を更新しました",
          description: "レシピの順序を変更しました",
        })
      } catch (error) {
        console.error('Failed to update meal plan order:', error)
        toast({
          title: "エラー",
          description: "献立の更新に失敗しました",
          variant: "destructive",
        })
        // エラー時は元の順序に戻す
        setMealPlan(mealPlan)
      }
    }
  }

  // レシピを削除
  const handleRemoveRecipe = async (recipeId: string) => {
    if (!mealPlan) return

    const updatedRecipes = mealPlan.recipes.filter(recipe => recipe.id !== recipeId)
    
    setMealPlan({
      ...mealPlan,
      recipes: updatedRecipes
    })

    try {
      const response = await fetch('/api/meal-plans', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealPlanId: mealPlan.id,
          reorderedRecipes: updatedRecipes.map(recipe => ({
            savedRecipeId: recipe.savedRecipeId
          }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to remove recipe')
      }

      toast({
        title: "レシピを削除しました",
        description: "献立からレシピを削除しました",
      })
    } catch (error) {
      console.error('Failed to remove recipe:', error)
      toast({
        title: "エラー",
        description: "レシピの削除に失敗しました",
        variant: "destructive",
      })
      // エラー時は元に戻す
      setMealPlan(mealPlan)
    }
  }

  // レシピ詳細を表示
  const handleViewDetails = (recipe: SavedRecipe) => {
    setSelectedRecipe(recipe)
    setIsDetailDialogOpen(true)
  }

  // 買い物リストを生成（改善版）
  const generateShoppingList = () => {
    if (!mealPlan) return {}
    
    const allIngredients: ParsedIngredient[] = []
    
    mealPlan.recipes.forEach(recipe => {
      if (recipe.savedRecipe.recipeMaterial) {
        try {
          const materials = typeof recipe.savedRecipe.recipeMaterial === 'string' 
            ? JSON.parse(recipe.savedRecipe.recipeMaterial)
            : recipe.savedRecipe.recipeMaterial
          
          if (Array.isArray(materials)) {
            materials.forEach(material => {
              allIngredients.push(parseIngredient(material))
            })
          }
        } catch (e) {
          // JSON parse failed, treat as string
          if (typeof recipe.savedRecipe.recipeMaterial === 'string') {
            allIngredients.push(parseIngredient(recipe.savedRecipe.recipeMaterial))
          }
        }
      }
    })
    
    // 同じ商品を合計
    const combinedIngredients = combineIngredients(allIngredients)
    
    // カテゴリ別にグループ化
    const categorized: { [key: string]: ParsedIngredient[] } = {}
    
    combinedIngredients.forEach(ingredient => {
      if (!categorized[ingredient.category]) {
        categorized[ingredient.category] = []
      }
      categorized[ingredient.category].push(ingredient)
    })
    
    // 各カテゴリ内でソート
    Object.keys(categorized).forEach(category => {
      categorized[category].sort((a, b) => a.name.localeCompare(b.name))
    })
    
    return categorized
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center justify-between h-16 px-4">
            <h1 className="text-xl font-bold text-green-600">今週の献立</h1>
          </div>
        </header>
        <main className="flex-1 container px-4 py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-green-600">今週の献立</h1>
          <div className="flex items-center space-x-2">
            <Link href="/swipe">
              <Button variant="outline" size="sm">
                レシピを追加
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="plan">献立表</TabsTrigger>
            <TabsTrigger value="shopping">買い物リスト</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plan">
            {!mealPlan || mealPlan.recipes.length === 0 ? (
              <Card className="p-8 text-center">
                <ChefHat className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">献立がまだありません</h3>
                <p className="text-gray-600 mb-4">
                  スワイプページでレシピに❤️をつけると、自動的に献立が作成されます
                </p>
                <Link href="/swipe">
                  <Button>
                    レシピをスワイプする
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">今週の献立</h2>
                  <p className="text-sm text-gray-600">
                    ドラッグして順序を変更できます
                  </p>
                </div>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={mealPlan.recipes.map(recipe => recipe.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {mealPlan.recipes.map((recipe, index) => (
                        <SortableRecipeItem
                          key={recipe.id}
                          recipe={recipe}
                          dayIndex={index}
                          onRemove={handleRemoveRecipe}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
            
            <div className="mt-6">
              <Link href="/swipe">
                <Button className="w-full">
                  さらにレシピを追加する
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          <TabsContent value="shopping">
            <Card className="p-4">
              <h3 className="font-medium mb-4">買い物リスト</h3>
              {(() => {
                const shoppingList = generateShoppingList()
                const categoryOrder = ['野菜', '肉類', '魚介類', '卵・乳製品', '穀物', '調味料', 'その他']
                
                return Object.keys(shoppingList).length > 0 ? (
                  <div className="space-y-4">
                    {categoryOrder
                      .filter(category => shoppingList[category]?.length > 0)
                      .map(category => (
                        <div key={category} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            {category}
                          </h4>
                          <div className="space-y-1 ml-5">
                            {shoppingList[category].map((ingredient, index) => (
                              <div key={index} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`ingredient-${category}-${index}`}
                                  className="mr-2 h-4 w-4"
                                />
                                <label htmlFor={`ingredient-${category}-${index}`} className="text-sm">
                                  {ingredient.name}
                                  {ingredient.amount && (
                                    <span className="text-gray-500 ml-1">
                                      ({ingredient.amount}{ingredient.unit})
                                    </span>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">献立が設定されていないため、買い物リストを生成できません</p>
                  </div>
                )
              })()}
              
              {(() => {
                const shoppingList = generateShoppingList()
                return Object.keys(shoppingList).length > 0 && (
                  <div className="mt-6 flex gap-2">
                    <Button variant="outline" className="flex-1">
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
                        className="w-4 h-4 mr-2"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      コピー
                    </Button>
                    <Button variant="outline" className="flex-1">
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
                        className="w-4 h-4 mr-2"
                      >
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                      </svg>
                      共有
                    </Button>
                  </div>
                )
              })()}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* レシピ詳細ダイアログ */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedRecipe?.recipeTitle}
            </DialogTitle>
            <DialogDescription>
              {selectedRecipe?.recipeDescription}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecipe && (
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
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            {selectedRecipe?.recipeUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedRecipe.recipeUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                詳細レシピを見る
              </Button>
            )}
            <Button onClick={() => setIsDetailDialogOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <path d="m17 14 3 3 3-3"></path>
              <path d="M22 17v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"></path>
              <path d="m11 8 3-3 3 3"></path>
              <path d="M14 5v9"></path>
            </svg>
            <span className="text-xs mt-1">スワイプ</span>
          </Link>
          <Link href="/plan" className="flex flex-col items-center justify-center text-green-600">
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

