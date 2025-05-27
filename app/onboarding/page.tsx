import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function OnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-green-600">MealMatch</h1>
          <Button variant="ghost" size="sm">
            スキップ
          </Button>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              <div className="w-8 h-1 rounded-full bg-green-600"></div>
              <div className="w-8 h-1 rounded-full bg-gray-300"></div>
              <div className="w-8 h-1 rounded-full bg-gray-300"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">あなたの好みを教えてください</h2>
            <p className="text-gray-600">好きな食材や料理のジャンルを選んで、あなた好みのレシピを提案します。</p>
          </div>

          <Card className="p-4 mb-6">
            <h3 className="font-medium mb-3">好きな食材</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs">
                <span>鶏肉</span>
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
                  className="w-3 h-3 ml-1 text-green-600"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs">
                <span>豚肉</span>
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
                  className="w-3 h-3 ml-1 text-green-600"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs">
                <span>牛肉</span>
              </div>
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs">
                <span>魚</span>
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
                  className="w-3 h-3 ml-1 text-green-600"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs">
                <span>トマト</span>
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
                  className="w-3 h-3 ml-1 text-green-600"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs">
                <span>なす</span>
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs">
                <span>きのこ</span>
              </div>
              <button className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500">
                + もっと見る
              </button>
            </div>

            <h3 className="font-medium mb-3">好きな料理ジャンル</h3>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs">
                <span>和食</span>
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
                  className="w-3 h-3 ml-1 text-green-600"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
              <div className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs">
                <span>イタリアン</span>
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
                  className="w-3 h-3 ml-1 text-green-600"
                >
                  <path d="M20 6 9 17l-5-5"></path>
                </svg>
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs">
                <span>中華</span>
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs">
                <span>韓国料理</span>
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs">
                <span>エスニック</span>
              </div>
              <button className="rounded-full border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500">
                + もっと見る
              </button>
            </div>
          </Card>

          <Card className="p-4 mb-6">
            <h3 className="font-medium mb-3">苦手な食材</h3>
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs">
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
              <div className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs">
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
          </Card>

          <div className="flex justify-between">
            <Button variant="outline">戻る</Button>
            <Button>次へ</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
