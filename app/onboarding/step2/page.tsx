import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function OnboardingStep2Page() {
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
              <div className="w-8 h-1 rounded-full bg-gray-300"></div>
              <div className="w-8 h-1 rounded-full bg-green-600"></div>
              <div className="w-8 h-1 rounded-full bg-gray-300"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">世帯情報を設定しましょう</h2>
            <p className="text-gray-600">あなたの世帯に合わせた献立と買い物リストを作成します。</p>
          </div>

          <Card className="p-4 mb-6">
            <h3 className="font-medium mb-3">世帯人数</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <Button variant="outline" className="h-12">
                1人
              </Button>
              <Button variant="outline" className="h-12 bg-green-100">
                2人
              </Button>
              <Button variant="outline" className="h-12">
                3人
              </Button>
              <Button variant="outline" className="h-12">
                4人
              </Button>
              <Button variant="outline" className="h-12">
                5人
              </Button>
              <Button variant="outline" className="h-12">
                6人以上
              </Button>
            </div>

            <h3 className="font-medium mb-3">週の開始日</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              <Button variant="outline" className="bg-green-100">
                月曜日
              </Button>
              <Button variant="outline">日曜日</Button>
            </div>

            <h3 className="font-medium mb-3">夕食を作る曜日</h3>
            <div className="grid grid-cols-7 gap-1 mb-6">
              <div className="text-center">
                <div className="text-xs mb-1">月</div>
                <div className="w-8 h-8 mx-auto rounded-full bg-green-100 flex items-center justify-center">
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
                    className="w-4 h-4 text-green-600"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1">火</div>
                <div className="w-8 h-8 mx-auto rounded-full bg-green-100 flex items-center justify-center">
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
                    className="w-4 h-4 text-green-600"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1">水</div>
                <div className="w-8 h-8 mx-auto rounded-full bg-green-100 flex items-center justify-center">
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
                    className="w-4 h-4 text-green-600"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1">木</div>
                <div className="w-8 h-8 mx-auto rounded-full bg-green-100 flex items-center justify-center">
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
                    className="w-4 h-4 text-green-600"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1">金</div>
                <div className="w-8 h-8 mx-auto rounded-full bg-green-100 flex items-center justify-center">
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
                    className="w-4 h-4 text-green-600"
                  >
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1">土</div>
                <div className="w-8 h-8 mx-auto rounded-full bg-gray-100 flex items-center justify-center"></div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1">日</div>
                <div className="w-8 h-8 mx-auto rounded-full bg-gray-100 flex items-center justify-center"></div>
              </div>
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
