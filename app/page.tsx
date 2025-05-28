'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './contexts/AuthContext'
import { useToast } from "@/components/ui/use-toast"
import { usePopularRecipes } from '@/hooks/useRecipes'
import { useMealPlan } from '@/hooks/useMealPlan'
import { Header } from '@/components/layout/Header'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { WelcomeSection } from '@/components/home/WelcomeSection'
import { MatchingSection } from '@/components/home/MatchingSection'
import { PopularRecipesSection } from '@/components/home/PopularRecipesSection'
import { MealPlanSection } from '@/components/home/MealPlanSection'
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat } from "lucide-react"

export default function Home() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // カスタムフックを使用してデータを取得
  const { recipes, loading: recipesLoading } = usePopularRecipes(4)
  const { mealPlan, loading: mealPlanLoading } = useMealPlan()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "ログアウト",
        description: "正常にログアウトしました",
      })
      router.push('/auth/login')
    } catch (error) {
      toast({
        title: "エラー",
        description: "ログアウトに失敗しました",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // リダイレクト中
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 container px-4 py-6">
        <WelcomeSection user={user} />
        <MatchingSection />
        
        {/* レシピ検索機能 */}
        <div className="mb-6">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold">レシピを検索</h3>
              <Link href="/recipes">
                <Button variant="outline" size="sm">
                  <ChefHat className="w-4 h-4 mr-2" />
                  詳細検索
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              特定のレシピを探したい時はこちら
            </p>
          </div>
        </div>

        <PopularRecipesSection 
          recipes={recipes} 
          loading={recipesLoading} 
        />
        
        <MealPlanSection 
          mealPlan={mealPlan} 
          loading={mealPlanLoading} 
        />
      </main>

      <BottomNavigation />
    </div>
  )
}
