'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from '@/app/contexts/AuthContext'
import { RecipeCard } from '@/components/RecipeCard'
import { Pencil, Trash2, Plus, Loader2, UserPlus, Users, ChefHat, Activity, Home, ArrowLeft, Upload, FileText, Download } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
  _count?: {
    savedRecipes: number
    mealPlans: number
  }
}

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

interface ActivityStat {
  totalUsers: number
  totalRecipes: number
  newUsersThisWeek: number
  activeUsersThisWeek: number
  recipesByCategory?: { [key: string]: number }
  totalSavedRecipes?: number
}

interface BulkRecipe {
  recipeTitle: string
  recipeDescription: string
  foodImageUrl: string
  recipeIndication: string
  recipeMaterial: string[]
  recipeInstructions?: string
}

interface RakutenRecipe {
  recipeId: string
  recipeTitle: string
  recipeUrl: string
  foodImageUrl: string
  recipeDescription: string
  recipeMaterial: string[]
  recipeIndication: string
  categoryName: string
  nickname: string
  recipePublishday: string
  shop: number
  pickup: number
  rank: string
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [stats, setStats] = useState<ActivityStat>({
    totalUsers: 0,
    totalRecipes: 0,
    newUsersThisWeek: 0,
    activeUsersThisWeek: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // 新しいレシピ追加用の状態
  const [newRecipe, setNewRecipe] = useState({
    recipeTitle: '',
    recipeDescription: '',
    foodImageUrl: '',
    recipeIndication: '',
    recipeMaterial: [''],
    recipeInstructions: ''
  })
  const [addRecipeDialogOpen, setAddRecipeDialogOpen] = useState(false)
  
  // バルクインポート用の状態
  const [bulkImportDialogOpen, setBulkImportDialogOpen] = useState(false)
  const [bulkImportMethod, setBulkImportMethod] = useState<'csv' | 'json' | 'rakuten'>('csv')
  const [bulkRecipes, setBulkRecipes] = useState<BulkRecipe[]>([])
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [jsonText, setJsonText] = useState('')
  const [bulkImporting, setBulkImporting] = useState(false)
  
  // 楽天レシピAPI用の状態
  const [rakutenSearchQuery, setRakutenSearchQuery] = useState('')
  const [rakutenRecipes, setRakutenRecipes] = useState<RakutenRecipe[]>([])
  const [selectedRakutenRecipes, setSelectedRakutenRecipes] = useState<Set<string>>(new Set())
  const [rakutenSearching, setRakutenSearching] = useState(false)
  const [rakutenImporting, setRakutenImporting] = useState(false)
  const [apiTestInfo, setApiTestInfo] = useState<any>(null) // API接続テスト情報
  
  // 人気レシピ自動インポート用の状態
  const [autoImporting, setAutoImporting] = useState(false)
  
  // APIテスト用の状態
  const [apiTesting, setApiTesting] = useState(false)
  const [apiTestResults, setApiTestResults] = useState<any>(null)
  const [apiTestDialogOpen, setApiTestDialogOpen] = useState(false)
  
  // レシピ詳細表示用の状態
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [recipeDetailDialogOpen, setRecipeDetailDialogOpen] = useState(false)
  
  const { toast } = useToast()

  // 管理者権限チェック
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      if (user.role !== 'admin') {
        toast({
          title: "アクセス拒否",
          description: "管理者権限が必要です",
          variant: "destructive",
        })
        router.push('/')
        return
      }
    }
  }, [user, authLoading, router, toast])

  // データ取得
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchUsers(),
        fetchRecipes(),
        fetchStats()
      ])
    } catch (error) {
      toast({
        title: "エラー",
        description: "データの取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    if (response.ok) {
      const data = await response.json()
      setUsers(data)
    }
  }

  const fetchRecipes = async () => {
    const response = await fetch('/api/admin/recipes')
    if (response.ok) {
      const data = await response.json()
      setRecipes(data)
    }
  }

  const fetchStats = async () => {
    const response = await fetch('/api/admin/stats')
    if (response.ok) {
      const data = await response.json()
      setStats(data)
    }
  }

  // レシピ追加
  const addRecipe = async () => {
    try {
      const response = await fetch('/api/admin/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRecipe,
          recipeMaterial: JSON.stringify(newRecipe.recipeMaterial.filter(m => m.trim()))
        }),
      })

      if (!response.ok) throw new Error('Failed to add recipe')

      toast({
        title: "成功",
        description: "レシピを追加しました",
      })

      setNewRecipe({
        recipeTitle: '',
        recipeDescription: '',
        foodImageUrl: '',
        recipeIndication: '',
        recipeMaterial: [''],
        recipeInstructions: ''
      })
      setAddRecipeDialogOpen(false)
      fetchRecipes()
    } catch (error) {
      toast({
        title: "エラー",
        description: "レシピの追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  // レシピ削除
  const deleteRecipe = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/admin/recipes/${recipeId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete recipe')

      toast({
        title: "成功",
        description: "レシピを削除しました",
      })

      fetchRecipes()
    } catch (error) {
      toast({
        title: "エラー",
        description: "レシピの削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  // ユーザー削除
  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete user')

      toast({
        title: "成功",
        description: "ユーザーを削除しました",
      })

      fetchUsers()
    } catch (error) {
      toast({
        title: "エラー",
        description: "ユーザーの削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  // CSVファイルの解析
  const parseCSV = (csvText: string): BulkRecipe[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const recipe: any = {}
      
      headers.forEach((header, index) => {
        if (header === 'recipeMaterial') {
          recipe[header] = values[index] ? values[index].split(';').map(m => m.trim()) : []
        } else {
          recipe[header] = values[index] || ''
        }
      })
      
      return recipe as BulkRecipe
    })
  }

  // CSVファイルの読み込み
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const csvText = e.target?.result as string
      try {
        const parsedRecipes = parseCSV(csvText)
        setBulkRecipes(parsedRecipes)
        toast({
          title: "CSVファイル読み込み完了",
          description: `${parsedRecipes.length}件のレシピを読み込みました`,
        })
      } catch (error) {
        toast({
          title: "エラー",
          description: "CSVファイルの解析に失敗しました",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // JSONテキストの解析
  const handleJSONParse = () => {
    try {
      const parsedRecipes = JSON.parse(jsonText) as BulkRecipe[]
      setBulkRecipes(parsedRecipes)
      toast({
        title: "JSON解析完了",
        description: `${parsedRecipes.length}件のレシピを読み込みました`,
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "JSONの解析に失敗しました。正しい形式で入力してください",
        variant: "destructive",
      })
    }
  }

  // バルクインポート実行
  const executeBulkImport = async () => {
    if (bulkRecipes.length === 0) {
      toast({
        title: "エラー",
        description: "インポートするレシピがありません",
        variant: "destructive",
      })
      return
    }

    setBulkImporting(true)
    
    try {
      const response = await fetch('/api/admin/recipes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: bulkRecipes }),
      })

      if (!response.ok) throw new Error('Failed to bulk import recipes')

      const result = await response.json()

      toast({
        title: "バルクインポート完了",
        description: `${result.imported}件のレシピを追加しました`,
      })

      // リセット
      setBulkRecipes([])
      setCsvFile(null)
      setJsonText('')
      setBulkImportDialogOpen(false)
      fetchRecipes()
    } catch (error) {
      toast({
        title: "エラー",
        description: "バルクインポートに失敗しました",
        variant: "destructive",
      })
    } finally {
      setBulkImporting(false)
    }
  }

  // CSVテンプレートのダウンロード
  const downloadCSVTemplate = () => {
    const csvContent = `recipeTitle,recipeDescription,foodImageUrl,recipeIndication,recipeMaterial,recipeInstructions
"鶏の唐揚げ","ジューシーで美味しい唐揚げ","https://example.com/karaage.jpg","30分","鶏もも肉 300g;醤油 大さじ2;酒 大さじ1;にんにく 1片;生姜 1片;片栗粉 適量;揚げ油 適量","1. 鶏もも肉を一口大に切る\n2. 醤油、酒、すりおろした生姜とにんにくを混ぜて鶏肉を30分漬け込む\n3. 片栗粉をまぶして170℃の油で5分揚げる\n4. 一度取り出して3分休ませる\n5. 180℃の油で2分二度揚げして完成"
"野菜炒め","シャキシャキ野菜炒め","https://example.com/yasai.jpg","15分","キャベツ 1/4個;人参 1/2本;ピーマン 2個;もやし 1袋;豚肉 100g;醤油 大さじ1;塩胡椒 少々","1. 野菜を食べやすい大きさに切る\n2. フライパンで豚肉を炒める\n3. 硬い野菜から順に加えて炒める\n4. 調味料で味付けして完成"`
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'recipe_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // JSONテンプレートの生成
  const getJSONTemplate = () => {
    return JSON.stringify([
      {
        recipeTitle: "鶏の唐揚げ",
        recipeDescription: "ジューシーで美味しい唐揚げ",
        foodImageUrl: "https://example.com/karaage.jpg",
        recipeIndication: "30分",
        recipeMaterial: ["鶏もも肉 300g", "醤油 大さじ2", "酒 大さじ1", "にんにく 1片", "生姜 1片", "片栗粉 適量", "揚げ油 適量"],
        recipeInstructions: "1. 鶏もも肉を一口大に切る\n2. 醤油、酒、すりおろした生姜とにんにくを混ぜて鶏肉を30分漬け込む\n3. 片栗粉をまぶして170℃の油で5分揚げる\n4. 一度取り出して3分休ませる\n5. 180℃の油で2分二度揚げして完成"
      },
      {
        recipeTitle: "野菜炒め",
        recipeDescription: "シャキシャキ野菜炒め",
        foodImageUrl: "https://example.com/yasai.jpg",
        recipeIndication: "15分",
        recipeMaterial: ["キャベツ 1/4個", "人参 1/2本", "ピーマン 2個", "もやし 1袋", "豚肉 100g", "醤油 大さじ1", "塩胡椒 少々"],
        recipeInstructions: "1. 野菜を食べやすい大きさに切る\n2. フライパンで豚肉を炒める\n3. 硬い野菜から順に加えて炒める\n4. 調味料で味付けして完成"
      }
    ], null, 2)
  }

  // 楽天レシピAPI検索
  const searchRakutenRecipes = async () => {
    if (!rakutenSearchQuery.trim()) {
      toast({
        title: "エラー",
        description: "検索キーワードを入力してください",
        variant: "destructive",
      })
      return
    }

    setRakutenSearching(true)
    
    try {
      const response = await fetch(`/api/admin/recipes/rakuten/search?keyword=${encodeURIComponent(rakutenSearchQuery)}`)
      
      if (!response.ok) throw new Error('Failed to search recipes')

      const data = await response.json()
      setRakutenRecipes(data.recipes || [])
      setApiTestInfo(data.apiTest || null) // API接続テスト情報を保存
      
      // API接続状況に応じたメッセージ表示
      let toastVariant: "default" | "destructive" = "default"
      let toastTitle = "検索完了"
      
      if (data.apiTest?.status === 'NO_API_KEY') {
        toastVariant = "destructive"
        toastTitle = "API未設定"
      } else if (data.apiTest?.status === 'API_ERROR') {
        toastVariant = "destructive"
        toastTitle = "API接続エラー"
      } else if (data.apiTest?.status === 'EXCEPTION') {
        toastVariant = "destructive"
        toastTitle = "システムエラー"
      }
      
      toast({
        title: toastTitle,
        description: data.message || `${data.recipes?.length || 0}件のレシピが見つかりました`,
        variant: toastVariant,
      })
    } catch (error) {
      toast({
        title: "エラー",
        description: "楽天レシピの検索に失敗しました",
        variant: "destructive",
      })
    } finally {
      setRakutenSearching(false)
    }
  }

  // 楽天レシピ選択の切り替え
  const toggleRakutenRecipeSelection = (recipeId: string) => {
    const newSelection = new Set(selectedRakutenRecipes)
    if (newSelection.has(recipeId)) {
      newSelection.delete(recipeId)
    } else {
      newSelection.add(recipeId)
    }
    setSelectedRakutenRecipes(newSelection)
  }

  // 全選択/全解除
  const toggleAllRakutenRecipes = () => {
    if (selectedRakutenRecipes.size === rakutenRecipes.length) {
      setSelectedRakutenRecipes(new Set())
    } else {
      setSelectedRakutenRecipes(new Set(rakutenRecipes.map(r => r.recipeId)))
    }
  }

  // 楽天レシピインポート実行
  const executeRakutenImport = async () => {
    if (selectedRakutenRecipes.size === 0) {
      toast({
        title: "エラー",
        description: "インポートするレシピを選択してください",
        variant: "destructive",
      })
      return
    }

    setRakutenImporting(true)
    
    try {
      const selectedRecipes = rakutenRecipes.filter(recipe => 
        selectedRakutenRecipes.has(recipe.recipeId)
      )

      const response = await fetch('/api/admin/recipes/rakuten/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: selectedRecipes }),
      })

      if (!response.ok) throw new Error('Failed to import recipes')

      const result = await response.json()

      toast({
        title: "楽天レシピインポート完了",
        description: `${result.imported}件のレシピを追加しました`,
      })

      // リセット
      setSelectedRakutenRecipes(new Set())
      setRakutenRecipes([])
      setRakutenSearchQuery('')
      setBulkImportDialogOpen(false)
      fetchRecipes()
    } catch (error) {
      toast({
        title: "エラー",
        description: "楽天レシピのインポートに失敗しました",
        variant: "destructive",
      })
    } finally {
      setRakutenImporting(false)
    }
  }

  // 人気レシピ自動インポート実行
  const executeAutoImport = async () => {
    setAutoImporting(true)
    
    try {
      const response = await fetch('/api/admin/recipes/rakuten/auto-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 20 }), // 20件の人気レシピをインポート
      })

      if (!response.ok) throw new Error('Failed to auto-import recipes')

      const result = await response.json()

      toast({
        title: "人気レシピ自動インポート完了",
        description: `${result.imported}件のレシピを追加しました（スキップ: ${result.skipped}件）`,
      })

      // レシピリストを更新
      fetchRecipes()
      
      // 詳細情報をコンソールに出力
      console.log('🎉 Auto-import result:', result)
      
    } catch (error) {
      toast({
        title: "エラー",
        description: "人気レシピの自動インポートに失敗しました",
        variant: "destructive",
      })
    } finally {
      setAutoImporting(false)
    }
  }

  // レシピ詳細表示
  const showRecipeDetail = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setRecipeDetailDialogOpen(true)
  }

  // APIテスト実行
  const executeApiTest = async () => {
    setApiTesting(true)
    setApiTestResults(null)
    
    try {
      const response = await fetch('/api/admin/recipes/rakuten/test')
      
      if (!response.ok) throw new Error('Failed to test API')

      const result = await response.json()
      setApiTestResults(result)
      setApiTestDialogOpen(true)
      
      // 結果に応じたトースト表示
      if (result.status === 'SUCCESS') {
        toast({
          title: "API接続テスト成功",
          description: "楽天レシピAPIに正常に接続できています",
        })
      } else if (result.status === 'NO_API_KEY') {
        toast({
          title: "APIキー未設定",
          description: "RAKUTEN_APPLICATION_IDを.env.localに設定してください",
          variant: "destructive",
        })
      } else {
        toast({
          title: "API接続に問題があります",
          description: "詳細はテスト結果をご確認ください",
          variant: "destructive",
        })
      }
      
    } catch (error) {
      toast({
        title: "エラー",
        description: "APIテストの実行に失敗しました",
        variant: "destructive",
      })
    } finally {
      setApiTesting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ホームに戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
            <p className="text-gray-600">システム全体の管理と監視</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          管理者: {user.name || user.email}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>概要</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>ユーザー管理</span>
          </TabsTrigger>
          <TabsTrigger value="recipes" className="flex items-center space-x-2">
            <ChefHat className="w-4 h-4" />
            <span>レシピ管理</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>アクティビティ</span>
          </TabsTrigger>
        </TabsList>

        {/* 概要タブ */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  今週新規: {stats.newUsersThisWeek}名
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">総レシピ数</CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRecipes}</div>
                <p className="text-xs text-muted-foreground">
                  保存されたレシピ: {stats.totalSavedRecipes || 0}件
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">アクティブユーザー</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeUsersThisWeek}</div>
                <p className="text-xs text-muted-foreground">
                  今週アクティブ
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">稼働率</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.5%</div>
                <p className="text-xs text-muted-foreground">
                  システム稼働率
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* カテゴリ別レシピダッシュボード */}
          {stats.recipesByCategory && Object.keys(stats.recipesByCategory).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ別レシピ統計</CardTitle>
                <CardDescription>
                  各カテゴリのレシピ数と分布
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.recipesByCategory).map(([category, count]) => (
                    <div key={category} className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{count}</div>
                      <div className="text-sm text-gray-600">{category}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ユーザー管理タブ */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ユーザー管理</CardTitle>
              <CardDescription>
                登録ユーザーの一覧と管理
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名前</TableHead>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>権限</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead>保存レシピ数</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? '管理者' : '一般ユーザー'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString('ja-JP')}</TableCell>
                      <TableCell>{user._count?.savedRecipes || 0}</TableCell>
                      <TableCell>
                        {user.role !== 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ユーザーを削除しますか？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  この操作は取り消せません。ユーザーのすべてのデータが削除されます。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteUser(user.id)}>
                                  削除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* レシピ管理タブ */}
        <TabsContent value="recipes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>レシピ管理</CardTitle>
                  <CardDescription>
                    システム内のレシピの管理と追加
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={executeAutoImport} 
                    disabled={autoImporting}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    {autoImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        インポート中...
                      </>
                    ) : (
                      <>
                        <ChefHat className="w-4 h-4 mr-2" />
                        人気レシピ自動インポート
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={executeApiTest} 
                    disabled={apiTesting}
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    {apiTesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        テスト中...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        API接続テスト
                      </>
                    )}
                  </Button>
                  
                  <Dialog open={bulkImportDialogOpen} onOpenChange={setBulkImportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        一括インポート
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>レシピ一括インポート</DialogTitle>
                        <DialogDescription>
                          CSVファイルまたはJSONテキストから複数のレシピを一度に追加できます
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs value={bulkImportMethod} onValueChange={(value) => setBulkImportMethod(value as 'csv' | 'json' | 'rakuten')}>
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="csv">CSVファイル</TabsTrigger>
                          <TabsTrigger value="json">JSONテキスト</TabsTrigger>
                          <TabsTrigger value="rakuten">楽天レシピ</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="csv" className="space-y-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={downloadCSVTemplate}>
                                <Download className="w-4 h-4 mr-2" />
                                テンプレートダウンロード
                              </Button>
                              <span className="text-sm text-gray-600">
                                まずテンプレートをダウンロードして形式を確認してください
                              </span>
                            </div>
                            
                            <div>
                              <Label htmlFor="csv-upload">CSVファイルを選択</Label>
                              <Input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                onChange={handleCSVUpload}
                                className="mt-2"
                              />
                              {csvFile && (
                                <p className="text-sm text-green-600 mt-2">
                                  ファイル選択済み: {csvFile.name}
                                </p>
                              )}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              <p className="font-semibold">CSVフォーマット:</p>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>recipeTitle: レシピタイトル</li>
                                <li>recipeDescription: レシピの説明</li>
                                <li>foodImageUrl: 画像URL</li>
                                <li>recipeIndication: 調理時間</li>
                                <li>recipeMaterial: 材料（セミコロン区切り）</li>
                                <li>recipeInstructions: 作り方</li>
                              </ul>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="json" className="space-y-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="json-text">JSONテキスト</Label>
                              <Textarea
                                id="json-text"
                                value={jsonText}
                                onChange={(e) => setJsonText(e.target.value)}
                                placeholder={getJSONTemplate()}
                                className="mt-2 h-64 font-mono text-sm"
                              />
                              <div className="flex items-center gap-2 mt-2">
                                <Button variant="outline" size="sm" onClick={handleJSONParse}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  JSON解析
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setJsonText(getJSONTemplate())}
                                >
                                  テンプレート挿入
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="rakuten" className="space-y-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="レシピを検索（例：唐揚げ、パスタ、カレー）"
                                value={rakutenSearchQuery}
                                onChange={(e) => setRakutenSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchRakutenRecipes()}
                                className="flex-1"
                              />
                              <Button 
                                onClick={searchRakutenRecipes} 
                                disabled={rakutenSearching}
                              >
                                {rakutenSearching ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  '検索'
                                )}
                              </Button>
                            </div>
                            
                            {/* API接続テスト情報表示 */}
                            {apiTestInfo && (
                              <div className={`border rounded-lg p-3 text-sm ${
                                apiTestInfo.status === 'SUCCESS' ? 'bg-green-50 border-green-200' :
                                apiTestInfo.status === 'NO_API_KEY' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-red-50 border-red-200'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold">
                                    {apiTestInfo.status === 'SUCCESS' ? '✅ API接続成功' :
                                     apiTestInfo.status === 'NO_API_KEY' ? '⚠️ APIキー未設定' :
                                     apiTestInfo.status === 'API_ERROR' ? '❌ API接続エラー' :
                                     '💥 システムエラー'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(apiTestInfo.timestamp).toLocaleString('ja-JP')}
                                  </span>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div>APIキー: {apiTestInfo.hasApiKey ? `設定済み (${apiTestInfo.apiKeyPreview || 'Hidden'})` : '未設定'}</div>
                                  {apiTestInfo.httpStatus && (
                                    <div>HTTPステータス: {apiTestInfo.httpStatus} {apiTestInfo.httpStatusText}</div>
                                  )}
                                  {apiTestInfo.error && (
                                    <div className="text-red-600">エラー: {apiTestInfo.error}</div>
                                  )}
                                  {apiTestInfo.recommendation && (
                                    <div className="text-blue-600 mt-2">💡 {apiTestInfo.recommendation}</div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {rakutenRecipes.length > 0 && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    {rakutenRecipes.length}件のレシピが見つかりました
                                  </span>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={toggleAllRakutenRecipes}
                                  >
                                    {selectedRakutenRecipes.size === rakutenRecipes.length ? '全解除' : '全選択'}
                                  </Button>
                                </div>
                                
                                <div className="max-h-96 overflow-y-auto border rounded-lg">
                                  <div className="grid grid-cols-1 gap-2 p-4">
                                    {rakutenRecipes.map((recipe) => (
                                      <div 
                                        key={recipe.recipeId}
                                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                          selectedRakutenRecipes.has(recipe.recipeId) 
                                            ? 'bg-blue-50 border-blue-300' 
                                            : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => toggleRakutenRecipeSelection(recipe.recipeId)}
                                      >
                                        <div className="flex items-start gap-3">
                                          <input
                                            type="checkbox"
                                            checked={selectedRakutenRecipes.has(recipe.recipeId)}
                                            onChange={() => toggleRakutenRecipeSelection(recipe.recipeId)}
                                            className="mt-1"
                                          />
                                          {recipe.foodImageUrl && (
                                            <img
                                              src={recipe.foodImageUrl}
                                              alt={recipe.recipeTitle}
                                              className="w-16 h-16 object-cover rounded"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                target.src = `https://via.placeholder.com/64x64/f0f0f0/999999?text=${encodeURIComponent(recipe.recipeTitle.charAt(0))}`
                                              }}
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">
                                              {recipe.recipeTitle}
                                            </h4>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                              {recipe.recipeDescription}
                                            </p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                              <span>{recipe.recipeIndication}</span>
                                              <span>by {recipe.nickname}</span>
                                              <span>{recipe.categoryName}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {selectedRakutenRecipes.size > 0 && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                      {selectedRakutenRecipes.size}件のレシピが選択されています
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                      
                      {bulkRecipes.length > 0 && (
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">プレビュー ({bulkRecipes.length}件)</h4>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                              {bulkRecipes.slice(0, 5).map((recipe, index) => (
                                <div key={index} className="text-sm border-b pb-2">
                                  <p className="font-medium">{recipe.recipeTitle}</p>
                                  <p className="text-gray-600 truncate">{recipe.recipeDescription}</p>
                                  <p className="text-xs text-gray-500">
                                    {recipe.recipeIndication} | 材料: {recipe.recipeMaterial.length}個
                                    {recipe.recipeInstructions && ' | 作り方あり'}
                                  </p>
                                </div>
                              ))}
                              {bulkRecipes.length > 5 && (
                                <p className="text-sm text-gray-500">...他 {bulkRecipes.length - 5}件</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkImportDialogOpen(false)}>
                          キャンセル
                        </Button>
                        {bulkImportMethod === 'rakuten' ? (
                          <Button 
                            onClick={executeRakutenImport} 
                            disabled={selectedRakutenRecipes.size === 0 || rakutenImporting}
                          >
                            {rakutenImporting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                インポート中...
                              </>
                            ) : (
                              `${selectedRakutenRecipes.size}件をインポート`
                            )}
                          </Button>
                        ) : (
                          <Button 
                            onClick={executeBulkImport} 
                            disabled={bulkRecipes.length === 0 || bulkImporting}
                          >
                            {bulkImporting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                インポート中...
                              </>
                            ) : (
                              `${bulkRecipes.length}件をインポート`
                            )}
                          </Button>
                        )}
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={addRecipeDialogOpen} onOpenChange={setAddRecipeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        レシピ追加
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>新しいレシピを追加</DialogTitle>
                        <DialogDescription>
                          新しいレシピの情報を入力してください
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">レシピタイトル</Label>
                          <Input
                            id="title"
                            value={newRecipe.recipeTitle}
                            onChange={(e) => setNewRecipe({...newRecipe, recipeTitle: e.target.value})}
                            placeholder="レシピ名を入力"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">説明</Label>
                          <Textarea
                            id="description"
                            value={newRecipe.recipeDescription}
                            onChange={(e) => setNewRecipe({...newRecipe, recipeDescription: e.target.value})}
                            placeholder="レシピの説明を入力"
                          />
                        </div>
                        <div>
                          <Label htmlFor="image">画像URL</Label>
                          <Input
                            id="image"
                            value={newRecipe.foodImageUrl}
                            onChange={(e) => setNewRecipe({...newRecipe, foodImageUrl: e.target.value})}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="time">調理時間</Label>
                          <Input
                            id="time"
                            value={newRecipe.recipeIndication}
                            onChange={(e) => setNewRecipe({...newRecipe, recipeIndication: e.target.value})}
                            placeholder="20分"
                          />
                        </div>
                        <div>
                          <Label>材料（1行につき1つ）</Label>
                          {newRecipe.recipeMaterial.map((material, index) => (
                            <Input
                              key={index}
                              value={material}
                              onChange={(e) => {
                                const newMaterials = [...newRecipe.recipeMaterial]
                                newMaterials[index] = e.target.value
                                setNewRecipe({...newRecipe, recipeMaterial: newMaterials})
                              }}
                              placeholder="材料名 分量"
                              className="mt-2"
                            />
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNewRecipe({
                              ...newRecipe,
                              recipeMaterial: [...newRecipe.recipeMaterial, '']
                            })}
                            className="mt-2"
                          >
                            材料を追加
                          </Button>
                        </div>
                        <div>
                          <Label htmlFor="instructions">作り方</Label>
                          <Textarea
                            id="instructions"
                            value={newRecipe.recipeInstructions}
                            onChange={(e) => setNewRecipe({...newRecipe, recipeInstructions: e.target.value})}
                            placeholder="1. 材料を準備する&#10;2. 下処理をする&#10;3. 調理する&#10;4. 味付けして完成"
                            className="mt-2 h-32"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            手順ごとに改行して入力してください
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddRecipeDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button onClick={addRecipe}>
                          追加
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    variant="admin"
                    onView={showRecipeDetail}
                    onDelete={(recipeId) => {
                      // AlertDialogを表示する代わりに、直接削除確認を行う
                      if (window.confirm('このレシピを削除しますか？この操作は取り消せません。')) {
                        deleteRecipe(recipe.id)
                      }
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* アクティビティタブ */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>アクティビティ監視</CardTitle>
              <CardDescription>
                ユーザーの活動状況とシステムの使用状況
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">最近の登録ユーザー</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {users.slice(0, 5).map((user) => (
                          <div key={user.id} className="flex items-center justify-between">
                            <span className="text-sm">{user.name || user.email}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">人気レシピ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {recipes.slice(0, 5).map((recipe) => (
                          <div key={recipe.id} className="flex items-center justify-between">
                            <span className="text-sm truncate">{recipe.recipeTitle}</span>
                            <span className="text-xs text-gray-500">
                              {recipe.recipeIndication}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* レシピ詳細ダイアログ */}
      <Dialog open={recipeDetailDialogOpen} onOpenChange={setRecipeDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>レシピ詳細</DialogTitle>
            <DialogDescription>
              レシピの詳細情報を確認できます
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecipe && (
            <div className="space-y-4">
              {/* レシピ画像 */}
              <div className="aspect-video relative rounded-lg overflow-hidden">
                {selectedRecipe.foodImageUrl ? (
                  <img
                    src={selectedRecipe.foodImageUrl}
                    alt={selectedRecipe.recipeTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* レシピ情報 */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-semibold">レシピタイトル</Label>
                  <p className="text-lg font-medium">{selectedRecipe.recipeTitle}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-semibold">説明</Label>
                  <p className="text-gray-700">{selectedRecipe.recipeDescription}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">調理時間</Label>
                    <p className="text-gray-700">{selectedRecipe.recipeIndication}</p>
                  </div>
                  
                  {selectedRecipe.shopName && (
                    <div>
                      <Label className="text-sm font-semibold">投稿者</Label>
                      <p className="text-gray-700">{selectedRecipe.shopName}</p>
                    </div>
                  )}
                </div>
                
                {selectedRecipe.recipeMaterial && (
                  <div>
                    <Label className="text-sm font-semibold">材料</Label>
                    <div className="mt-2">
                      {(() => {
                        try {
                          const materials = JSON.parse(selectedRecipe.recipeMaterial)
                          return (
                            <ul className="list-disc list-inside space-y-1">
                              {materials.map((material: string, index: number) => (
                                <li key={index} className="text-gray-700">{material}</li>
                              ))}
                            </ul>
                          )
                        } catch {
                          return <p className="text-gray-700">{selectedRecipe.recipeMaterial}</p>
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                {selectedRecipe.recipeInstructions && (
                  <div>
                    <Label className="text-sm font-semibold">作り方</Label>
                    <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                      {selectedRecipe.recipeInstructions.split('\n').map((step, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <span className="text-gray-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedRecipe.recipeUrl && selectedRecipe.recipeUrl !== '#' && (
                  <div>
                    <Label className="text-sm font-semibold">レシピURL</Label>
                    <a 
                      href={selectedRecipe.recipeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline block"
                    >
                      元のレシピを見る
                    </a>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-semibold">登録日</Label>
                  <p className="text-gray-700">
                    {selectedRecipe.createdAt ? new Date(selectedRecipe.createdAt).toLocaleDateString('ja-JP') : '不明'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecipeDetailDialogOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* APIテスト結果ダイアログ */}
      <Dialog open={apiTestDialogOpen} onOpenChange={setApiTestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>楽天レシピAPI接続テスト結果</DialogTitle>
            <DialogDescription>
              APIの接続状況と詳細なテスト結果を確認できます
            </DialogDescription>
          </DialogHeader>
          
          {apiTestResults && (
            <div className="space-y-4">
              {/* 全体的な結果 */}
              <div className={`border rounded-lg p-4 ${
                apiTestResults.status === 'SUCCESS' ? 'bg-green-50 border-green-200' :
                apiTestResults.status === 'NO_API_KEY' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold">
                    {apiTestResults.status === 'SUCCESS' ? '✅ 接続成功' :
                     apiTestResults.status === 'NO_API_KEY' ? '⚠️ APIキー未設定' :
                     apiTestResults.status === 'PARTIAL_FAILURE' ? '⚠️ 部分的な問題' :
                     '❌ 接続失敗'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(apiTestResults.timestamp).toLocaleString('ja-JP')}
                  </span>
                </div>
                <p className="text-sm">{apiTestResults.message}</p>
                {apiTestResults.recommendation && (
                  <p className="text-sm text-blue-600 mb-1 bg-blue-50 p-2 rounded">
                    💡 推奨: 
                    <div className="mt-1 whitespace-pre-line">{apiTestResults.recommendation}</div>
                  </p>
                )}
              </div>
              
              {/* APIキー情報 */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">APIキー情報</h3>
                <div className="space-y-1 text-sm">
                  <div>設定状況: {apiTestResults.apiKey.exists ? '✅ 設定済み' : '❌ 未設定'}</div>
                  {apiTestResults.apiKey.exists && (
                    <>
                      <div>キー長: {apiTestResults.apiKey.length}文字</div>
                      <div>プレビュー: {apiTestResults.apiKey.preview}</div>
                      
                      {/* APIキー分析結果 */}
                      {apiTestResults.apiKey.analysis && (
                        <div className="mt-3 p-3 border rounded bg-gray-50">
                          <div className="font-medium mb-2">
                            🔍 APIキー分析結果: 
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              apiTestResults.apiKey.analysis.status === 'VALID' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {apiTestResults.apiKey.analysis.status === 'VALID' ? '有効' : '無効'}
                            </span>
                          </div>
                          
                          {apiTestResults.apiKey.analysis.issues && apiTestResults.apiKey.analysis.issues.length > 0 && (
                            <div className="mb-2">
                              <div className="text-red-600 font-medium text-xs mb-1">⚠️ 問題:</div>
                              <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                                {apiTestResults.apiKey.analysis.issues.map((issue: string, index: number) => (
                                  <li key={index}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {apiTestResults.apiKey.analysis.details && (
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>文字種: {apiTestResults.apiKey.analysis.details.isHex ? '16進数' : '混在'}</div>
                              <div>特殊文字: {apiTestResults.apiKey.analysis.details.hasSpecialChars ? 'あり' : 'なし'}</div>
                              <div>最初の8文字: {apiTestResults.apiKey.analysis.details.firstChars}</div>
                              <div>最後の8文字: {apiTestResults.apiKey.analysis.details.lastChars}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* テスト結果詳細 */}
              {apiTestResults.tests && apiTestResults.tests.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">詳細テスト結果</h3>
                  <div className="space-y-3">
                    {apiTestResults.tests.map((test: any, index: number) => (
                      <div key={index} className={`border rounded p-3 ${
                        test.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {test.success ? '✅' : '❌'} {test.testName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {test.responseTime}ms
                          </span>
                        </div>
                        
                        {test.httpStatus && (
                          <div className="text-sm text-gray-600 mb-1">
                            HTTPステータス: {test.httpStatus} {test.httpStatusText}
                          </div>
                        )}
                        
                        {test.error && (
                          <div className="text-sm text-red-600 mb-1">
                            エラー: {test.error}
                          </div>
                        )}
                        
                        {test.recommendation && (
                          <div className="text-sm text-blue-600 mb-1 bg-blue-50 p-2 rounded">
                            💡 推奨: 
                            <div className="mt-1 whitespace-pre-line">{test.recommendation}</div>
                          </div>
                        )}
                        
                        {test.note && (
                          <div className="text-sm text-gray-600 mb-1">
                            📝 {test.note}
                          </div>
                        )}
                        
                        {test.debugInfo && (
                          <div className="text-xs text-gray-500 mb-1 bg-gray-100 p-2 rounded">
                            🐛 デバッグ情報: {JSON.stringify(test.debugInfo, null, 2)}
                          </div>
                        )}
                        
                        {test.requestDetails && (
                          <div className="text-xs text-gray-500 mb-1">
                            📤 リクエスト詳細:
                            <div className="ml-2 mt-1">
                              <div>URL: {test.requestDetails.url}</div>
                              <div>メソッド: {test.requestDetails.method}</div>
                              {test.requestDetails.headers && (
                                <div>ヘッダー: {JSON.stringify(test.requestDetails.headers)}</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {test.requestUrl && (
                          <div className="text-xs text-gray-500 mb-1">
                            リクエストURL: {test.requestUrl}
                          </div>
                        )}
                        
                        {test.responseStructure && (
                          <div className="text-sm text-green-600 mb-1">
                            📊 レスポンス構造: {test.responseStructure.join(', ')}
                          </div>
                        )}
                        
                        {test.categoryBreakdown && (
                          <div className="text-sm text-gray-600 mb-1">
                            カテゴリ内訳: 大{test.categoryBreakdown.large}件, 中{test.categoryBreakdown.medium}件, 小{test.categoryBreakdown.small}件
                          </div>
                        )}
                        
                        {test.totalCategories && (
                          <div className="text-sm text-gray-600 mb-1">
                            取得カテゴリ数: {test.totalCategories}件
                          </div>
                        )}
                        
                        {test.categories && test.categories.length > 0 && (
                          <div className="text-sm text-gray-600 mb-1">
                            カテゴリ例: {test.categories.map((cat: any) => cat.categoryName).join(', ')}
                          </div>
                        )}
                        
                        {test.recipesFound !== undefined && (
                          <div className="text-sm text-gray-600 mb-1">
                            取得レシピ数: {test.recipesFound}件
                          </div>
                        )}
                        
                        {test.sampleRecipes && test.sampleRecipes.length > 0 && (
                          <div className="text-sm text-gray-600 mb-1">
                            レシピ例: {test.sampleRecipes.map((recipe: any) => recipe.recipeTitle).join(', ')}
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-2">
                          URL: {test.url}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* サマリー */}
              {apiTestResults.summary && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">テストサマリー</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{apiTestResults.summary.totalTests}</div>
                      <div className="text-sm text-gray-600">総テスト数</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{apiTestResults.summary.passed}</div>
                      <div className="text-sm text-gray-600">成功</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{apiTestResults.summary.failed}</div>
                      <div className="text-sm text-gray-600">失敗</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiTestDialogOpen(false)}>
              閉じる
            </Button>
            <Button onClick={executeApiTest} disabled={apiTesting}>
              {apiTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  再テスト中...
                </>
              ) : (
                '再テスト'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 