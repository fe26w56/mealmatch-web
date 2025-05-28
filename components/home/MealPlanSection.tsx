import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, ChefHat, Heart } from "lucide-react"
import { MealPlan } from '@/lib/types'

interface MealPlanSectionProps {
  mealPlan: MealPlan | null
  loading: boolean
}

export function MealPlanSection({ mealPlan, loading }: MealPlanSectionProps) {
  const dayNames = [
    { day: 1, name: '月曜日' },
    { day: 2, name: '火曜日' },
    { day: 3, name: '水曜日' },
    { day: 4, name: '木曜日' },
    { day: 5, name: '金曜日' }
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">今週の献立</h2>
        <Link href="/plan">
          <Button variant="outline" size="sm">
            詳細
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <Card className="p-6">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">献立を読み込み中...</p>
          </div>
        </Card>
      ) : !mealPlan || mealPlan.recipes.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="mb-4">
            <ChefHat className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">献立がまだありません</h3>
            <p className="text-sm text-gray-600 mb-4">
              マッチング機能でレシピにいいねすると、自動的に献立が作成されます
            </p>
          </div>
          <div className="space-y-2">
            <Link href="/swipe">
              <Button className="w-full">
                <Heart className="w-4 h-4 mr-2" />
                レシピマッチングを始める
              </Button>
            </Link>
            <Link href="/plan">
              <Button variant="outline" className="w-full">
                献立ページで手動作成
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {dayNames.map(({ day, name }) => {
            const dayRecipe = mealPlan.recipes.find(r => r.dayOfWeek === day)
            return (
              <Card key={day} className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-12 text-center">
                    <div className="text-xs font-medium text-gray-500 mb-1">{name}</div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-xs font-bold text-green-700">{day}</span>
                    </div>
                  </div>
                  
                  {dayRecipe ? (
                    <div className="flex-1 flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {dayRecipe.savedRecipe.foodImageUrl ? (
                          <img
                            src={dayRecipe.savedRecipe.foodImageUrl}
                            alt={dayRecipe.savedRecipe.recipeTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ChefHat className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {dayRecipe.savedRecipe.recipeTitle}
                        </h4>
                        {dayRecipe.savedRecipe.shopName && (
                          <p className="text-xs text-gray-500 truncate">
                            by {dayRecipe.savedRecipe.shopName}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ChefHat className="w-6 h-6 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">未設定</p>
                        <p className="text-xs text-gray-400">レシピを追加してください</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
          
          <Link href="/plan">
            <Button className="w-full mt-4">
              <ChefHat className="w-4 h-4 mr-2" />
              献立の詳細を見る
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
} 