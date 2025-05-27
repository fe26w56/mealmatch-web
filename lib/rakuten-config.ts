// 楽天ウェブサービスAPI設定
export const RAKUTEN_CONFIG = {
  // 楽天ウェブサービスのアプリIDを設定してください
  // https://webservice.rakuten.co.jp/app/list で取得できます
  // テスト用の仮のIDを設定（実際の開発では環境変数から取得）
  APPLICATION_ID: process.env.RAKUTEN_APPLICATION_ID || '1001',
  
  // APIのベースURL
  BASE_URL: 'https://app.rakuten.co.jp/services/api',
  
  // レシピAPI関連のURL
  RECIPE_CATEGORY_LIST: '/Recipe/CategoryList/20170426',
  RECIPE_CATEGORY_RANKING: '/Recipe/CategoryRanking/20170426',
}

// APIリクエストのデフォルトパラメータ
export const getDefaultParams = () => ({
  applicationId: RAKUTEN_CONFIG.APPLICATION_ID,
  format: 'json',
  formatVersion: 2,
}) 