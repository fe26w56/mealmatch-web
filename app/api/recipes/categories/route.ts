import { NextResponse } from 'next/server'
import { RAKUTEN_CONFIG, getDefaultParams } from '@/lib/rakuten-config'
import { mockCategories } from '@/lib/mock-recipes'
import type { RecipeCategoryResponse } from '@/lib/types/recipe'

// レシピカテゴリ一覧の取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryType = searchParams.get('categoryType') || '' // large, medium, small, または空文字（全て）

    // まず楽天APIを試す
    try {
      const defaultParams = getDefaultParams()
      const params = new URLSearchParams()
      
      // デフォルトパラメータを追加
      Object.entries(defaultParams).forEach(([key, value]) => {
        params.append(key, String(value))
      })
      
      // カテゴリタイプが指定されている場合は追加
      if (categoryType) {
        params.append('categoryType', categoryType)
      }

      const url = `${RAKUTEN_CONFIG.BASE_URL}${RAKUTEN_CONFIG.RECIPE_CATEGORY_LIST}?${params}`
      
      const response = await fetch(url)
      
      if (response.ok) {
        const data: RecipeCategoryResponse = await response.json()
        
        if (data.result && !data.error) {
          return NextResponse.json(data.result)
        }
      }
    } catch (error) {
      console.log('Rakuten API not available, using mock data')
    }

    // 楽天APIが使用できない場合はモックデータを返す
    return NextResponse.json(mockCategories)
  } catch (error) {
    console.error('Failed to fetch recipe categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe categories' },
      { status: 500 }
    )
  }
} 