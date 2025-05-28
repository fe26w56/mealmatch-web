import { AdminRecipe, MealPlan, SavedRecipe } from '@/lib/types'

// API エラーハンドリング
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// 共通のfetch関数
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new ApiError(response.status, `API request failed: ${response.statusText}`)
  }

  return response.json()
}

// レシピ関連のAPI
export const recipeApi = {
  // レシピ一覧取得
  getRecipes: async (params?: {
    limit?: number
    shuffle?: boolean
    page?: number
    search?: string
    sort?: string
  }): Promise<AdminRecipe[]> => {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.shuffle) searchParams.append('shuffle', 'true')
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.sort) searchParams.append('sort', params.sort)

    const url = `/api/recipes${searchParams.toString() ? `?${searchParams}` : ''}`
    return apiRequest<AdminRecipe[]>(url)
  },

  // レシピ詳細取得
  getRecipe: async (id: string): Promise<AdminRecipe> => {
    return apiRequest<AdminRecipe>(`/api/recipes/${id}`)
  },
}

// 献立関連のAPI
export const mealPlanApi = {
  // 献立取得
  getMealPlan: async (): Promise<MealPlan | null> => {
    try {
      return await apiRequest<MealPlan>('/api/meal-plans')
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null
      }
      throw error
    }
  },

  // 献立更新
  updateMealPlan: async (mealPlanId: string, recipes: { savedRecipeId: string }[]): Promise<MealPlan> => {
    return apiRequest<MealPlan>('/api/meal-plans', {
      method: 'PUT',
      body: JSON.stringify({
        mealPlanId,
        reorderedRecipes: recipes,
      }),
    })
  },
}

// 保存レシピ関連のAPI
export const savedRecipeApi = {
  // レシピ保存
  saveRecipe: async (recipe: Omit<SavedRecipe, 'id' | 'userId' | 'createdAt'>): Promise<SavedRecipe> => {
    return apiRequest<SavedRecipe>('/api/saved-recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    })
  },

  // 保存レシピ一覧取得
  getSavedRecipes: async (): Promise<SavedRecipe[]> => {
    return apiRequest<SavedRecipe[]>('/api/saved-recipes')
  },
} 