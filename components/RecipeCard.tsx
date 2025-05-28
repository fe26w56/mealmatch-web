import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, Eye, Trash2 } from "lucide-react"
import { BaseRecipe } from '@/lib/types'

interface RecipeCardProps {
  recipe: BaseRecipe
  variant?: 'default' | 'admin'
  onView?: (recipe: BaseRecipe) => void
  onDelete?: (recipeId: string) => void
  onClick?: () => void
  className?: string
}

export function RecipeCard({ 
  recipe, 
  variant = 'default', 
  onView, 
  onDelete, 
  onClick,
  className = ""
}: RecipeCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onView) {
      onView(recipe)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(recipe.recipeId)
    }
  }

  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      <div className="aspect-square relative overflow-hidden">
        {recipe.foodImageUrl ? (
          <img
            src={recipe.foodImageUrl}
            alt={recipe.recipeTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://via.placeholder.com/200x200/f0f0f0/999999?text=${encodeURIComponent(recipe.recipeTitle.charAt(0))}`
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
          {recipe.recipeTitle}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          {recipe.recipeIndication && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{recipe.recipeIndication}</span>
            </div>
          )}
          {recipe.shopName && (
            <span className="truncate ml-2">{recipe.shopName}</span>
          )}
        </div>

        {variant === 'admin' && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleViewClick}
            >
              <Eye className="w-3 h-3 mr-1" />
              詳細
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 