import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function OnboardingStep3Page() {
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
              <div className="w-8 h-1 rounded-full bg-gray-300"></div>
              <div className="w-8 h-1 rounded-full bg-green-600"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">通知設定</h2>
            <p className="text-gray-600">献立の確認や買い物のリマインドを設定しましょう。</p>
          </div>

          <Card className="p-4 mb-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input type="checkbox" id="reminder" className="h-4 w-4 mr-2" checked />
                <label htmlFor="reminder" className="text-sm font-medium">
                  週初めリマインド
                </label>
              </div>
              <div className="pl-6">
                <p className="text-xs text-gray-500 mb-2">週の献立を決める時間をお知らせします</p>
                <div className="grid grid-cols-2 gap-2">
                  <select className="rounded-md border border-gray-300 p-2 text-sm">
                    <option>月曜日</option>
                    <option>日曜日</option>
                  </select>
                  <select className="rounded-md border border-gray-300 p-2 text-sm">
                    <option>9:00</option>
                    <option>10:00</option>
                    <option>11:00</option>
                    <option>12:00</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="daily" className="h-4 w-4 mr-2" checked />
                <label htmlFor="daily" className="text-sm font-medium">
                  今日の献立通知
                </label>
              </div>
              <div className="pl-6">
                <p className="text-xs text-gray-500 mb-2">毎日の献立を通知します</p>
                <select className="rounded-md border border-gray-300 p-2 text-sm w-full">
                  <option>16:00</option>
                  <option>17:00</option>
                  <option>18:00</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-4 mb-6">
            <h3 className="font-medium mb-3">アクセシビリティ設定</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input type="checkbox" id="largeText" className="h-4 w-4 mr-2" />
                <label htmlFor="largeText" className="text-sm font-medium">
                  大きい文字サイズ
                </label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="altSwipe" className="h-4 w-4 mr-2" />
                <label htmlFor="altSwipe" className="text-sm font-medium">
                  スワイプ操作の代替
                </label>
              </div>
              <p className="text-xs text-gray-500">これらの設定は後からいつでも変更できます</p>
            </div>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline">戻る</Button>
            <Button>始める</Button>
          </div>
        </div>
      </main>
    </div>
  )
}
