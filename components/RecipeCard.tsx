import { Card } from "@/components/ui/card"
import { Clock, ChefHat, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Recipe {
  id: string
  recipeId?: string
  recipeTitle: string
  recipeDescription?: string
  foodImageUrl?: string
  recipeIndication?: string
  shopName?: string
  rank?: string
  createdAt?: string
  recipeMaterial?: string
  recipeInstructions?: string
  recipeUrl?: string
}

interface RecipeCardProps {
  recipe: Recipe
  variant?: 'default' | 'admin'
  onView?: (recipe: Recipe) => void
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
      onDelete(recipe.id)
    }
  }

  return (
    <Card 
      className={`overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow ${className}`}
      onClick={handleCardClick}
    >
      <div className="aspect-video relative">
        {recipe.foodImageUrl ? (
          <img
            src={recipe.foodImageUrl}
            alt={recipe.recipeTitle}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = `https://via.placeholder.com/300x200/f0f0f0/999999?text=${encodeURIComponent(recipe.recipeTitle.charAt(0))}`
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ChefHat className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* ランキングバッジ */}
        {recipe.rank && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            #{recipe.rank}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold truncate text-sm md:text-base">{recipe.recipeTitle}</h3>
        
        {recipe.recipeDescription && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {recipe.recipeDescription}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center text-xs text-gray-500 space-x-3">
            {recipe.recipeIndication && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {recipe.recipeIndication}
              </span>
            )}
            {recipe.shopName && (
              <span className="truncate">
                by {recipe.shopName}
              </span>
            )}
          </div>
          
          {variant === 'admin' && (
            <div className="flex gap-2">
              {onView && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewClick}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteClick}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {variant === 'admin' && recipe.createdAt && (
          <div className="text-xs text-gray-400 mt-2">
            登録日: {new Date(recipe.createdAt).toLocaleDateString('ja-JP')}
          </div>
        )}
      </div>
    </Card>
  )
} 