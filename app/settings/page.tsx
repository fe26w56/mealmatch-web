import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-green-600">設定</h1>
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
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="text-xs mt-1">ホーム</span>
          </Link>
          <Link href="/swipe" className="flex flex-col items-center justify-center text-gray-500">
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
              <path d="m17 14 3 3 3-3"></path>
              <path d="M22 17v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"></path>
              <path d="m11 8 3-3 3 3"></path>
              <path d="M14 5v9"></path>
            </svg>
            <span className="text-xs mt-1">スワイプ</span>
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
          <Link href="/settings" className="flex flex-col items-center justify-center text-green-600">
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
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span className="text-xs mt-1">設定</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}
