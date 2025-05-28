import { useState, useEffect, useRef } from 'react'
import { MealPlan } from '@/lib/types'
import { mealPlanApi, ApiError } from '@/lib/utils/api'

// 週の開始日（月曜日）を取得する関数
function getWeekStart(date: Date = new Date()): string {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
  return monday.toISOString().split('T')[0] // YYYY-MM-DD形式
}

export function useMealPlan() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cachedWeekRef = useRef<string | null>(null)
  const cachedDataRef = useRef<MealPlan | null>(null)

  const fetchMealPlan = async (forceRefresh = false) => {
    try {
      const currentWeek = getWeekStart()
      
      // キャッシュされたデータがあり、同じ週で、強制更新でない場合はキャッシュを使用
      if (!forceRefresh && cachedWeekRef.current === currentWeek && cachedDataRef.current) {
        setMealPlan(cachedDataRef.current)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      const data = await mealPlanApi.getMealPlan()
      
      // データをキャッシュ
      cachedWeekRef.current = currentWeek
      cachedDataRef.current = data
      
      setMealPlan(data)
    } catch (err) {
      console.error('Failed to fetch meal plan:', err)
      if (err instanceof ApiError) {
        setError(`API Error: ${err.message}`)
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateMealPlan = (updatedMealPlan: MealPlan) => {
    const currentWeek = getWeekStart()
    // キャッシュも更新
    cachedWeekRef.current = currentWeek
    cachedDataRef.current = updatedMealPlan
    setMealPlan(updatedMealPlan)
  }

  const clearCache = () => {
    cachedWeekRef.current = null
    cachedDataRef.current = null
  }

  useEffect(() => {
    fetchMealPlan()
  }, [])

  return { 
    mealPlan, 
    loading, 
    error, 
    refetch: (forceRefresh = false) => fetchMealPlan(forceRefresh),
    updateMealPlan,
    clearCache
  }
} 