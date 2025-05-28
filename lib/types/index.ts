// ユーザー関連の型
export interface User {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  createdAt?: string
}

// レシピ関連の型
export interface BaseRecipe {
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

export interface AdminRecipe extends BaseRecipe {}

export interface SavedRecipe extends BaseRecipe {
  userId: string
  liked: boolean
}

// 献立関連の型
export interface MealPlanRecipe {
  id: string
  mealPlanId: string
  savedRecipeId: string
  dayOfWeek: number
  mealType: string
  order?: number
  savedRecipe: SavedRecipe
}

export interface MealPlan {
  id: string
  userId: string
  weekStart: string
  createdAt: string
  updatedAt: string
  recipes: MealPlanRecipe[]
}

// API レスポンス関連の型
export interface RecipesResponse {
  recipes: AdminRecipe[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// バルクレシピ関連の型
export interface BulkRecipe {
  recipeTitle: string
  recipeDescription: string
  foodImageUrl: string
  recipeIndication: string
  recipeMaterial: string[]
  recipeInstructions?: string
}

// コンポーネントプロパティ関連の型
export interface RecipeCardProps {
  recipe: BaseRecipe
  variant?: 'default' | 'admin'
  onView?: (recipe: BaseRecipe) => void
  onDelete?: (recipeId: string) => void
  onClick?: () => void
  className?: string
} 