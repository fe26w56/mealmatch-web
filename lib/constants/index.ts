// アプリケーション設定
export const APP_CONFIG = {
  name: 'MealMatch',
  description: '楽天レシピAPIを活用した料理レシピ管理・献立計画アプリケーション',
  version: '1.0.0',
} as const

// ページネーション設定
export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 100,
} as const

// 曜日設定
export const WEEKDAYS = [
  { day: 0, name: '月曜日', short: '月' },
  { day: 1, name: '火曜日', short: '火' },
  { day: 2, name: '水曜日', short: '水' },
  { day: 3, name: '木曜日', short: '木' },
  { day: 4, name: '金曜日', short: '金' },
  { day: 5, name: '土曜日', short: '土' },
  { day: 6, name: '日曜日', short: '日' },
] as const

// 食事タイプ
export const MEAL_TYPES = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
} as const

// ソート設定
export const SORT_OPTIONS = [
  { value: 'newest', label: '新着順' },
  { value: 'oldest', label: '古い順' },
  { value: 'title', label: 'タイトル順' },
  { value: 'shop', label: 'ショップ名順' },
] as const

// ナビゲーション設定
export const NAVIGATION_ITEMS = [
  { href: '/', label: 'ホーム', icon: 'Home' },
  { href: '/swipe', label: 'マッチ', icon: 'Heart' },
  { href: '/recipes', label: '検索', icon: 'ChefHat' },
  { href: '/plan', label: '献立', icon: 'Calendar' },
] as const

// API エンドポイント
export const API_ENDPOINTS = {
  recipes: '/api/recipes',
  mealPlans: '/api/meal-plans',
  savedRecipes: '/api/saved-recipes',
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
} as const

// エラーメッセージ
export const ERROR_MESSAGES = {
  network: 'ネットワークエラーが発生しました',
  unauthorized: '認証が必要です',
  forbidden: 'アクセス権限がありません',
  notFound: 'データが見つかりません',
  serverError: 'サーバーエラーが発生しました',
  unknown: '不明なエラーが発生しました',
} as const

// 成功メッセージ
export const SUCCESS_MESSAGES = {
  login: 'ログインしました',
  logout: 'ログアウトしました',
  signup: 'アカウントを作成しました',
  recipeSaved: 'レシピを保存しました',
  mealPlanUpdated: '献立を更新しました',
} as const 