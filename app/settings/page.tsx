'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Home, Heart, ChefHat } from "lucide-react"
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center h-16 px-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold text-green-600">MealMatch</h1>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-medium mb-4">プロフィール</h2>
            <Card className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mr-4"></div>
                <div>
                  <div className="font-medium">ユーザー名</div>
                  <div className="text-sm text-gray-500">example@email.com</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">世帯人数</label>
                  <div className="flex items-center justify-between mt-2">
                    <Button variant="outline" size="sm" className="w-10 h-10">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="w-10 h-10 bg-green-100">
                      2
                    </Button>
                    <Button variant="outline" size="sm" className="w-10 h-10">
                      3
                    </Button>
                    <Button variant="outline" size="sm" className="w-10 h-10">
                      4
                    </Button>
                    <Button variant="outline" size="sm" className="w-10 h-10">
                      5
                    </Button>
                    <Button variant="outline" size="sm" className="w-10 h-10">
                      6
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">週の開始日</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" size="sm" className="bg-green-100">
                      月曜日
                    </Button>
                    <Button variant="outline" size="sm">
                      日曜日
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-4">食の好み</h2>
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">味の好み</label>
                  <div className="space-y-4 mt-2">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs">薄味</span>
                        <span className="text-xs">濃い味</span>
                      </div>
                      <Slider defaultValue={[50]} max={100} step={1} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs">辛くない</span>
                        <span className="text-xs">辛い</span>
                      </div>
                      <Slider defaultValue={[30]} max={100} step={1} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">苦手な食材</label>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center rounded-full bg-red-100 px-3 py-1 text-xs">
                      <span>ピーマン</span>
                      <button className="ml-1 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center rounded-full bg-red-100 px-3 py-1 text-xs">
                      <span>なす</span>
                      <button className="ml-1 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center rounded-full bg-red-100 px-3 py-1 text-xs">
                      <span>セロリ</span>
                      <button className="ml-1 text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                    <button className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500">
                      + 追加
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-4">通知</h2>
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">週初めリマインド</div>
                    <div className="text-xs text-gray-500">週の献立を決める時間をお知らせします</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">今日の献立通知</div>
                    <div className="text-xs text-gray-500">毎日の献立を通知します</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-4">アクセシビリティ</h2>
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">大きい文字サイズ</div>
                    <div className="text-xs text-gray-500">文字を大きく表示します</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">スワイプ操作の代替</div>
                    <div className="text-xs text-gray-500">ボタンでレシピを選択できるようにします</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-medium mb-4">アカウント</h2>
            <Card className="p-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  ログアウト
                </Button>
                <Button variant="outline" className="w-full text-red-500">
                  アカウント削除
                </Button>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t bg-white">
        <div className="grid grid-cols-4 h-16">
          <Link href="/" className="flex flex-col items-center justify-center text-gray-500">
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">ホーム</span>
          </Link>
          <Link href="/swipe" className="flex flex-col items-center justify-center text-gray-500">
            <Heart className="w-5 h-5" />
            <span className="text-xs mt-1">マッチ</span>
          </Link>
          <Link href="/recipes" className="flex flex-col items-center justify-center text-gray-500">
            <ChefHat className="w-5 h-5" />
            <span className="text-xs mt-1">検索</span>
          </Link>
          <Link href="/plan" className="flex flex-col items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="text-xs mt-1">献立</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}
