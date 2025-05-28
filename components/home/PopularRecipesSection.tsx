import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RecipeCard } from '@/components/RecipeCard'
import { Loader2 } from "lucide-react"
import { AdminRecipe } from '@/lib/types'

interface PopularRecipesSectionProps {
  recipes: AdminRecipe[]
  loading: boolean
}

export function PopularRecipesSection({ recipes, loading }: PopularRecipesSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">人気のレシピ</h2>
        <Link href="/recipes">
          <Button variant="outline" size="sm">
            もっと見る
          </Button>
        </Link>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
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
                shopName: recipe.shopName,
                createdAt: recipe.createdAt,
                recipeMaterial: recipe.recipeMaterial,
                recipeInstructions: recipe.recipeInstructions,
                recipeUrl: recipe.recipeUrl
              }}
              onClick={() => window.location.href = `/recipe/${recipe.recipeId}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 