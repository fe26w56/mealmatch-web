import { useState, useEffect } from 'react'
import { AdminRecipe } from '@/lib/types'
import { recipeApi, ApiError } from '@/lib/utils/api'

interface UseRecipesParams {
  limit?: number
  shuffle?: boolean
  page?: number
  search?: string
  sort?: string
}

export function useRecipes(params: UseRecipesParams = {}) {
  const [recipes, setRecipes] = useState<AdminRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await recipeApi.getRecipes(params)
      setRecipes(data)
    } catch (err) {
      console.error('Failed to fetch recipes:', err)
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}`)
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [params.limit, params.shuffle, params.page, params.search, params.sort])

  return { 
    recipes, 
    loading, 
    error, 
    refetch: fetchRecipes 
  }
}

// 簡単なレシピ取得用のヘルパーフック
export function usePopularRecipes(limit: number = 4) {
  return useRecipes({ limit, shuffle: true })
} 