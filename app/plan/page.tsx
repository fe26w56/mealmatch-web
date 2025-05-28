'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from 'react'
import { ChefHat, Clock, Users, Loader2, GripVertical, Trash2, Eye, ExternalLink, X, Heart, ShoppingCart, Calendar } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { useMealPlan } from '@/hooks/useMealPlan'
import { MealPlan, MealPlanRecipe, SavedRecipe } from '@/lib/types'
import {
  DndContext,
  closestCenter,
  closestCorners,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  useDndMonitor,
  useDroppable,
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

const dayNames = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日']

// ドラッグ可能なレシピアイテムコンポーネント
function SortableRecipeItem({ recipe, dayIndex, onRemove, onViewDetails, isNewThisWeek }: { 
  recipe: MealPlanRecipe, 
  dayIndex: number,
  onRemove: (recipeId: string) => void,
  onViewDetails: (recipe: SavedRecipe) => void,
  isNewThisWeek: (createdAt: string) => boolean
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
      className={`bg-white border rounded-lg p-2 sm:p-4 shadow-sm relative hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      {isNewThisWeek(recipe.savedRecipe.createdAt) && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold z-10">
          NEW
        </div>
      )}
      
      {/* モバイル用レイアウト */}
      <div className="block sm:hidden">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onViewDetails(recipe.savedRecipe)}
        >
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3" />
          </div>
          
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
            {recipe.savedRecipe.foodImageUrl ? (
              <img
                src={recipe.savedRecipe.foodImageUrl}
                alt={recipe.savedRecipe.recipeTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `https://via.placeholder.com/40x40/f0f0f0/999999?text=${encodeURIComponent(recipe.savedRecipe.recipeTitle.charAt(0))}`
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="font-medium text-xs truncate leading-tight">
              {recipe.savedRecipe.recipeTitle.length > 20 
                ? `${recipe.savedRecipe.recipeTitle.substring(0, 20)}...`
                : recipe.savedRecipe.recipeTitle
              }
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded text-xs">
                {dayNames[dayIndex % dayNames.length]?.substring(0, 1) || '他'}
              </span>
              {recipe.savedRecipe.recipeIndication && (
                <span className="text-xs text-gray-500 truncate">
                  {recipe.savedRecipe.recipeIndication.length > 8 
                    ? `${recipe.savedRecipe.recipeIndication.substring(0, 8)}...`
                    : recipe.savedRecipe.recipeIndication
                  }
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(recipe.id)
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-6 w-6"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* デスクトップ用レイアウト */}
      <div className="hidden sm:block">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onViewDetails(recipe.savedRecipe)}
        >
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
            onClick={(e) => e.stopPropagation()}
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
                <ChefHat className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {recipe.savedRecipe.recipeTitle}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {recipe.savedRecipe.recipeIndication && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{recipe.savedRecipe.recipeIndication}</span>
                </div>
              )}
              {recipe.savedRecipe.shopName && (
                <span className="text-gray-500">by {recipe.savedRecipe.shopName}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                window.open(recipe.savedRecipe.recipeUrl, '_blank')
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(recipe.id)
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ドロップ可能な曜日エリアコンポーネント
function DroppableDayArea({ 
  dayIndex, 
  recipes, 
  onRemove, 
  onViewDetails, 
  isNewThisWeek,
  isDragOver 
}: { 
  dayIndex: number,
  recipes: MealPlanRecipe[],
  onRemove: (recipeId: string) => void,
  onViewDetails: (recipe: SavedRecipe) => void,
  isNewThisWeek: (createdAt: string) => boolean,
  isDragOver: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: `day-${dayIndex}`,
  })

  // 同じ曜日のレシピを取得（orderフィールドなしでソート）
  const sortedRecipes = recipes
    .filter(recipe => recipe.dayOfWeek === dayIndex)

  return (
    <Card 
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isDragOver 
          ? 'ring-4 ring-green-400 ring-offset-4 bg-green-50 border-green-400 shadow-lg scale-[1.02]' 
          : 'hover:shadow-md border-gray-200'
      }`}
    >
      {/* ドロップゾーンを拡張するための大きなエリア */}
      <div className={`p-4 sm:p-6 min-h-[120px] ${
        isDragOver ? 'bg-green-50' : ''
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-base sm:text-lg flex items-center gap-3">
            {dayNames[dayIndex]}
            {isDragOver && (
              <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full animate-bounce font-bold">
                📍 ここにドロップ
              </span>
            )}
          </h3>
        </div>
        
        {sortedRecipes.length === 0 ? (
          <div className={`text-center py-8 transition-all duration-300 rounded-lg ${
            isDragOver 
              ? 'text-green-700 bg-green-100 border-4 border-dashed border-green-400 scale-105' 
              : 'text-gray-500 border-2 border-dashed border-gray-200'
          }`}>
            <ChefHat className={`w-12 h-12 mx-auto mb-3 ${
              isDragOver ? 'text-green-500 animate-pulse' : 'text-gray-300'
            }`} />
            <p className="text-sm font-medium">
              {isDragOver ? '🎯 レシピをここにドロップしてください' : 'レシピが設定されていません'}
            </p>
            {isDragOver && (
              <p className="text-xs text-green-600 mt-2 animate-pulse">
                マウスを離すと追加されます
              </p>
            )}
            {!isDragOver && (
              <p className="text-xs text-gray-400 mt-2">
                スワイプ画面でいいねしたレシピが自動で追加されます
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <SortableContext 
              items={sortedRecipes.map(recipe => recipe.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedRecipes.map((recipe) => (
                <SortableRecipeItem
                  key={recipe.id}
                  recipe={recipe}
                  dayIndex={dayIndex}
                  onRemove={onRemove}
                  onViewDetails={onViewDetails}
                  isNewThisWeek={isNewThisWeek}
                />
              ))}
            </SortableContext>
            {isDragOver && (
              <div className="h-20 bg-green-100 border-4 border-dashed border-green-400 rounded-lg flex items-center justify-center animate-pulse">
                <span className="text-green-700 text-base font-bold">
                  🎯 ここに追加されます
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* 追加のドロップエリア（見えない大きなエリア） */}
        {isDragOver && (
          <div className="absolute inset-0 bg-green-100 bg-opacity-20 rounded-lg pointer-events-none border-4 border-green-400 border-dashed">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-700 font-bold text-lg">
              ✨ ドロップエリア ✨
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default function PlanPage() {
  // useMealPlanフックを使用
  const { mealPlan, loading, updateMealPlan, refetch } = useMealPlan()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragOverDay, setDragOverDay] = useState<number | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null)
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [shoppingList, setShoppingList] = useState<ParsedIngredient[]>([])
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState('plan')
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  interface ParsedIngredient {
    name: string
    amount: string
    unit: string
    category: string
  }

  const parseIngredient = (ingredient: string): ParsedIngredient => {
    // 数量と単位を抽出
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
    
    return { 
      name, 
      amount, 
      unit, 
      category
    }
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
          amount: (existingAmount + newAmount).toString(),
        })
      } else {
        combined.set(key, ingredient)
      }
    })
    
    return Array.from(combined.values())
  }

  // 今週の月曜日を計算
  const getThisWeekMonday = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayOfWeek = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    return monday
  }

  // レシピが今週新しく追加されたかどうかを判定
  const isNewThisWeek = (recipeCreatedAt: string) => {
    const thisWeekMonday = getThisWeekMonday()
    const recipeDate = new Date(recipeCreatedAt)
    return recipeDate >= thisWeekMonday
  }

  // 買い物リストを自動生成（献立が変更されたときに実行）
  useEffect(() => {
    if (mealPlan && activeTab === 'shopping') {
      generateShoppingList()
    }
  }, [mealPlan, activeTab])

  // チェック状態の管理
  const handleCheckItem = (itemKey: string) => {
    const newCheckedItems = new Set(checkedItems)
    if (newCheckedItems.has(itemKey)) {
      newCheckedItems.delete(itemKey)
    } else {
      newCheckedItems.add(itemKey)
    }
    setCheckedItems(newCheckedItems)
  }

  // 全てチェック/チェック解除
  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      const allKeys = shoppingList.map((item, index) => `${item.category}-${index}`)
      setCheckedItems(new Set(allKeys))
    } else {
      setCheckedItems(new Set())
    }
  }

  // ドラッグ開始時の処理
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  // ドラッグオーバー時の処理
  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event
    
    if (!over) {
      setDragOverDay(null)
      return
    }
    
    // 曜日エリアへのドロップを検出
    if (over.id.toString().startsWith('day-')) {
      const dayIndex = parseInt(over.id.toString().replace('day-', ''))
      setDragOverDay(dayIndex)
      return
    }
    
    // レシピカード上でも、その曜日をハイライト
    if (active && mealPlan) {
      const hoveredRecipe = mealPlan.recipes.find(r => r.id === over.id)
      if (hoveredRecipe) {
        setDragOverDay(hoveredRecipe.dayOfWeek)
        return
      }
    }
    
    setDragOverDay(null)
  }

  // ドラッグ終了時の処理（簡略化版）
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    setDragOverDay(null)

    if (!over || !mealPlan) {
      return
    }

    const draggedRecipe = mealPlan.recipes.find(recipe => recipe.id === active.id)
    if (!draggedRecipe) {
      return
    }

    // 曜日エリアにドロップした場合
    if (over.id.toString().startsWith('day-')) {
      const targetDayIndex = parseInt(over.id.toString().replace('day-', ''))
      
      if (draggedRecipe.dayOfWeek !== targetDayIndex) {
        await updateRecipeDay(draggedRecipe.id, targetDayIndex)
      }
      return
    }

    // 同じ曜日内でのレシピ並び替えは簡略化（orderフィールドなしでは複雑になるため）
    const targetRecipe = mealPlan.recipes.find(recipe => recipe.id === over.id)
    if (!targetRecipe) {
      return
    }

    // 異なる曜日間の移動
    if (draggedRecipe.dayOfWeek !== targetRecipe.dayOfWeek) {
      await updateRecipeDay(draggedRecipe.id, targetRecipe.dayOfWeek)
    }
  }

  // レシピの曜日を更新する関数
  const updateRecipeDay = async (recipeId: string, newDayIndex: number) => {
    if (!mealPlan) return

    try {
      const response = await fetch('/api/meal-plans/move', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId,
          newDayOfWeek: newDayIndex,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to move recipe')
      }

      const updatedRecipe = await response.json()
      
      // 献立を再取得して最新の状態に更新
      await refetch(true)

      toast({
        title: "献立を更新しました",
        description: "レシピを移動しました",
      })
    } catch (error) {
      console.error('Failed to move recipe:', error)
      toast({
        title: "エラー",
        description: "レシピの移動に失敗しました",
        variant: "destructive",
      })
    }
  }

  // レシピを削除する関数
  const handleRemoveRecipe = async (recipeId: string) => {
    if (!mealPlan) return

    try {
      const response = await fetch(`/api/meal-plans?recipeId=${recipeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove recipe')
      }

      // 献立を再取得して最新の状態に更新
      await refetch(true)

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
    }
  }

  const handleViewDetails = (recipe: SavedRecipe) => {
    setSelectedRecipe(recipe)
  }

  const generateShoppingList = () => {
    if (!mealPlan) return

    console.log('=== 買い物リスト生成開始 ===')
    console.log('献立の全レシピ数:', mealPlan.recipes.length)

    // 今週の献立（月〜金、dayOfWeek: 0-4）に設定されているレシピのみを取得
    const thisWeekRecipes = mealPlan.recipes.filter(recipe => 
      recipe.dayOfWeek >= 0 && recipe.dayOfWeek <= 4
    )
    
    console.log('今週の献立に設定されているレシピ数:', thisWeekRecipes.length)
    console.log('今週の献立レシピ:', thisWeekRecipes.map(r => `${dayNames[r.dayOfWeek]}: ${r.savedRecipe.recipeTitle}`))

    const allIngredients: ParsedIngredient[] = []
    
    thisWeekRecipes.forEach((recipe, recipeIndex) => {
      console.log(`\n--- レシピ ${recipeIndex + 1}: ${recipe.savedRecipe.recipeTitle} (${dayNames[recipe.dayOfWeek]}) ---`)
      console.log('材料データ:', recipe.savedRecipe.recipeMaterial)
      
      if (recipe.savedRecipe.recipeMaterial) {
        // 材料データの型を確認
        console.log('材料データの型:', typeof recipe.savedRecipe.recipeMaterial)
        
        let materialText: string = recipe.savedRecipe.recipeMaterial
        
        // JSONの場合は文字列に変換
        if (typeof materialText !== 'string') {
          try {
            const materialData: any = materialText
            if (Array.isArray(materialData)) {
              materialText = materialData.join('、')
            } else {
              materialText = JSON.stringify(materialData)
            }
          } catch (e) {
            console.error('材料データの変換エラー:', e)
            materialText = String(materialText)
          }
        }
        
        console.log('処理する材料テキスト:', materialText)
        
        const ingredients = materialText
          .split(/[、,\n]/)
          .map(ingredient => ingredient.trim())
          .filter(ingredient => ingredient.length > 0)
        
        console.log('分割後の材料リスト:', ingredients)
        console.log('材料数:', ingredients.length)
        
        const parsedIngredients = ingredients.map(ingredient => parseIngredient(ingredient))
        console.log('解析後の材料:', parsedIngredients)
        
        allIngredients.push(...parsedIngredients)
      }
    })

    console.log('\n=== 全材料リスト ===')
    console.log('総材料数:', allIngredients.length)
    console.log('材料一覧:', allIngredients.map(i => i.name))

    const combinedIngredients = combineIngredients(allIngredients)
    console.log('\n=== 統合後の材料リスト ===')
    console.log('統合後材料数:', combinedIngredients.length)
    
    // カテゴリ別にソート
    const sortedIngredients = combinedIngredients.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.name.localeCompare(b.name)
    })

    console.log('=== 買い物リスト生成完了 ===')
    setShoppingList(sortedIngredients)
  }

  // 買い物リストをコピー
  const copyShoppingList = () => {
    const listText = shoppingList
      .filter((_, index) => !checkedItems.has(`${_.category}-${index}`))
      .map(item => {
        const amount = item.amount ? `${item.amount}${item.unit} ` : ''
        return `□ ${amount}${item.name}`
      })
      .join('\n')

    navigator.clipboard.writeText(listText).then(() => {
      toast({
        title: "コピーしました",
        description: "買い物リストをクリップボードにコピーしました",
      })
    })
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
                  // SVGが見つからない場合はPNGを試す
                  const target = e.target as HTMLImageElement
                  if (target.src.includes('.svg')) {
                    target.src = '/logo.png'
                  } else {
                    // 両方とも見つからない場合はテキストロゴにフォールバック
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
              <Link href="/swipe">
                <Button variant="outline" size="sm">
                  レシピを追加
                </Button>
              </Link>
            </div>
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
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="MealMatch" 
              className="h-8 w-8"
              onError={(e) => {
                // SVGが見つからない場合はPNGを試す
                const target = e.target as HTMLImageElement
                if (target.src.includes('.svg')) {
                  target.src = '/logo.png'
                } else {
                  // 両方とも見つからない場合はテキストロゴにフォールバック
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
            <Link href="/swipe">
              <Button variant="outline" size="sm">
                レシピを追加
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-3 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="plan" className="text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              献立表
            </TabsTrigger>
            <TabsTrigger value="shopping" className="text-sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              買い物リスト
              {shoppingList.length > 0 && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {shoppingList.filter((_, index) => !checkedItems.has(`${_.category}-${index}`)).length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="plan">
            {!mealPlan ? (
              <Card className="p-6 sm:p-8 text-center">
                <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">献立がまだありません</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  マッチング画面でレシピに❤️をつけると、自動的に献立が作成されます
                </p>
                <Link href="/swipe">
                  <Button className="w-full sm:w-auto">
                    レシピをマッチングする
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
              
                {/* 新しいレシピの通知 */}
                {mealPlan.recipes.some(recipe => isNewThisWeek(recipe.savedRecipe.createdAt)) && (
                  <Card className="p-3 sm:p-4 bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 text-green-800">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">
                        今週新しくいいねしたレシピが献立に追加されました！
                      </span>
                    </div>
                    <p className="text-green-600 text-xs sm:text-sm mt-1">
                      NEWバッジが付いているレシピが新しく追加されたものです
                    </p>
                  </Card>
                )}

                {/* 買い物リストへのクイックアクセス */}
                {mealPlan.recipes.filter(recipe => recipe.dayOfWeek >= 0 && recipe.dayOfWeek <= 4).length > 0 && (
                  <Card className="p-3 sm:p-4 bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-800">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">
                          買い物リストが準備できました
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('shopping')}
                        className="text-blue-600 border-blue-300 hover:bg-blue-100"
                      >
                        確認する
                      </Button>
                    </div>
                    <p className="text-blue-600 text-xs sm:text-sm mt-1">
                      今週の献立（{mealPlan.recipes.filter(recipe => recipe.dayOfWeek >= 0 && recipe.dayOfWeek <= 4).length}品）から自動で買い物リストを作成しました
                    </p>
                  </Card>
                )}
                
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <div className="grid gap-4">
                    {dayNames.map((_, dayIndex) => (
                      <DroppableDayArea
                        key={dayIndex}
                        dayIndex={dayIndex}
                        recipes={mealPlan.recipes}
                        onRemove={handleRemoveRecipe}
                        onViewDetails={handleViewDetails}
                        isNewThisWeek={isNewThisWeek}
                        isDragOver={dragOverDay === dayIndex}
                      />
                    ))}
                  </div>
                  
                  <DragOverlay>
                    {activeId ? (
                      <div className="bg-white border-2 border-green-500 rounded-lg p-2 sm:p-4 shadow-lg opacity-90">
                        {(() => {
                          const draggedRecipe = mealPlan.recipes.find(r => r.id === activeId)
                          if (!draggedRecipe) return null
                          
                          return (
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                                {draggedRecipe.savedRecipe.foodImageUrl ? (
                                  <img
                                    src={draggedRecipe.savedRecipe.foodImageUrl}
                                    alt={draggedRecipe.savedRecipe.recipeTitle}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ChefHat className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">
                                  {draggedRecipe.savedRecipe.recipeTitle}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {dayNames[draggedRecipe.dayOfWeek]}から移動中...
                                </p>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            )}
            
            
            <div className="mt-4 sm:mt-6">
              <Link href="/swipe">
                <Button className="w-full">
                  さらにレシピを追加する
                </Button>
              </Link>
            </div>
          </TabsContent>
          
          <TabsContent value="shopping">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  買い物リスト
                </h3>
                {shoppingList.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {shoppingList.filter((_, index) => !checkedItems.has(`${_.category}-${index}`)).length} / {shoppingList.length} 項目
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckAll(checkedItems.size !== shoppingList.length)}
                    >
                      {checkedItems.size === shoppingList.length ? '全て解除' : '全て選択'}
                    </Button>
                  </div>
                )}
              </div>
              
              {shoppingList.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    // カテゴリ別にグループ化
                    const categorized: { [key: string]: ParsedIngredient[] } = {}
                    shoppingList.forEach(ingredient => {
                      if (!categorized[ingredient.category]) {
                        categorized[ingredient.category] = []
                      }
                      categorized[ingredient.category].push(ingredient)
                    })

                    const categoryOrder = ['野菜', '肉類', '魚介類', '卵・乳製品', '穀物', '調味料', 'その他']
                    
                    return categoryOrder
                      .filter(category => categorized[category]?.length > 0)
                      .map(category => (
                        <div key={category} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                            {category}
                          </h4>
                          <div className="space-y-1 ml-5">
                            {categorized[category].map((ingredient, index) => {
                              const itemKey = `${category}-${shoppingList.indexOf(ingredient)}`
                              const isChecked = checkedItems.has(itemKey)
                              
                              return (
                                <div key={index} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`ingredient-${itemKey}`}
                                    checked={isChecked}
                                    onChange={() => handleCheckItem(itemKey)}
                                    className="mr-2 h-4 w-4"
                                  />
                                  <label 
                                    htmlFor={`ingredient-${itemKey}`} 
                                    className={`text-sm ${
                                      isChecked ? 'line-through text-gray-500' : 'text-gray-700'
                                    }`}
                                  >
                                    {ingredient.name}
                                    {ingredient.amount && (
                                      <span className="text-gray-500 ml-1">
                                        ({ingredient.amount}{ingredient.unit})
                                      </span>
                                    )}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))
                  })()}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">今週の献立（月〜金）が設定されていないため、買い物リストを生成できません</p>
                  <Button 
                    onClick={() => setActiveTab('plan')}
                    className="mt-4"
                    variant="outline"
                  >
                    献立を設定する
                  </Button>
                </div>
              )}
              
              {shoppingList.length > 0 && (
                <div className="mt-6 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={copyShoppingList}
                  >
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
                    未完了をコピー
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setActiveTab('plan')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    献立を確認
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* レシピ詳細ダイアログ */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
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
            <Button onClick={() => setSelectedRecipe(null)}>
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
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
            </svg>
            <span className="text-xs mt-1">マッチ</span>
          </Link>
          <Link href="/recipes" className="flex flex-col items-center justify-center text-gray-500">
            <ChefHat className="w-5 h-5" />
            <span className="text-xs mt-1">検索</span>
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
        </div>
      </footer>
    </div>
  )
}

