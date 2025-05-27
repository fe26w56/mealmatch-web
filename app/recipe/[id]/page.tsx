'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Star, Heart, Loader2, ChefHat } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface RecipeDetail {
  recipeId: string
  recipeTitle: string
  recipeUrl: string
  foodImageUrl?: string
  recipeDescription?: string
  recipeMaterial?: string | string[]
  recipeIndication?: string
  recipeCost?: string
  recipePublishday?: string
  shopName?: string
  rank?: number
}

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const recipeId = params?.id as string

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        // まず保存済みレシピから取得を試す
        const savedResponse = await fetch('/api/saved-recipes')
        if (savedResponse.ok) {
          const savedRecipes = await savedResponse.json()
          const savedRecipe = savedRecipes.find((r: any) => r.recipeId === recipeId)
          
          if (savedRecipe) {
            setRecipe(savedRecipe)
            setLoading(false)
            return
          }
        }

        // 保存済みにない場合は、ランキングAPIから取得
        const rankingResponse = await fetch('/api/recipes/ranking?categoryId=30')
        if (rankingResponse.ok) {
          const recipes = await rankingResponse.json()
          const foundRecipe = recipes.find((r: RecipeDetail) => r.recipeId === recipeId)
          
          if (foundRecipe) {
            setRecipe(foundRecipe)
          } else {
            toast({
              title: "エラー",
              description: "レシピが見つかりませんでした",
              variant: "destructive",
            })
            router.push('/')
          }
        }
      } catch (error) {
        console.error('Failed to fetch recipe detail:', error)
        toast({
          title: "エラー",
          description: "レシピの取得に失敗しました",
          variant: "destructive",
        })
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (recipeId) {
      fetchRecipeDetail()
    }
  }, [recipeId, router, toast])

  const handleSaveRecipe = async () => {
    if (!recipe || saving) return

    setSaving(true)
    try {
      const response = await fetch('/api/saved-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe.recipeId,
          recipeTitle: recipe.recipeTitle,
          recipeUrl: recipe.recipeUrl,
          foodImageUrl: recipe.foodImageUrl,
          recipeDescription: recipe.recipeDescription,
          recipeMaterial: recipe.recipeMaterial,
          recipeIndication: recipe.recipeIndication,
          shopName: recipe.shopName,
        }),
      })

      if (response.ok) {
        toast({
          title: "保存完了",
          description: "レシピをお気に入りに追加しました",
        })
      } else {
        throw new Error('Failed to save recipe')
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "レシピの保存に失敗しました",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const parseMaterials = (materials: string | string[] | undefined): string[] => {
    if (!materials) return []
    
    if (Array.isArray(materials)) {
      return materials
    }
    
    try {
      const parsed = JSON.parse(materials)
      return Array.isArray(parsed) ? parsed : [materials]
    } catch (e) {
      return [materials]
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center h-16 px-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-green-600">レシピ詳細</h1>
          </div>
        </header>
        <main className="flex-1 container px-4 py-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="container flex items-center h-16 px-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-green-600">レシピ詳細</h1>
          </div>
        </header>
        <main className="flex-1 container px-4 py-6 text-center">
          <p>レシピが見つかりませんでした</p>
        </main>
      </div>
    )
  }

  const materials = parseMaterials(recipe.recipeMaterial)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold text-green-600">レシピ詳細</h1>
          </div>
          <Button 
            onClick={handleSaveRecipe} 
            disabled={saving}
            variant="ghost"
            size="sm"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        {/* レシピ画像と基本情報 */}
        <Card className="mb-6 overflow-hidden">
          <div className="aspect-video relative">
            {recipe.foodImageUrl ? (
              <img
                src={recipe.foodImageUrl}
                alt={recipe.recipeTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ChefHat className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">{recipe.recipeTitle}</h2>
            {recipe.recipeDescription && (
              <p className="text-gray-600 mb-3">{recipe.recipeDescription}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              {recipe.recipeIndication && (
                <Badge variant="secondary" className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {recipe.recipeIndication}
                </Badge>
              )}
              {recipe.recipeCost && (
                <Badge variant="secondary">
                  {recipe.recipeCost}
                </Badge>
              )}
              {recipe.rank && (
                <Badge variant="outline" className="text-orange-500">
                  ランキング #{recipe.rank}
                </Badge>
              )}
              {recipe.shopName && (
                <Badge variant="outline" className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {recipe.shopName}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* 材料 */}
        {materials.length > 0 && (
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3">材料</h3>
              <div className="space-y-2">
                {materials.map((material, index) => (
                  <div key={index} className="flex items-center py-1 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm">{material}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* 作り方へのリンク */}
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">作り方</h3>
            <p className="text-gray-600 mb-4">
              詳しい作り方は元のレシピページでご確認ください。
            </p>
            <Button asChild className="w-full">
              <a 
                href={recipe.recipeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                元のレシピを見る
              </a>
            </Button>
          </div>
        </Card>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSaveRecipe} 
            disabled={saving}
            className="flex-1"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Heart className="h-4 w-4 mr-2" />
            )}
            お気に入りに追加
          </Button>
          <Link href="/plan" className="flex-1">
            <Button variant="outline" className="w-full">
              献立に追加
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
} 