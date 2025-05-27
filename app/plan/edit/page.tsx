import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function PlanEditPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="text-xl font-bold text-green-600">献立編集</h1>
          <div className="flex items-center space-x-2">
            <Button size="sm">保存</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container px-4 py-6">
        <div className="grid gap-4">
          {["月曜日", "火曜日", "水曜日", "木曜日", "金曜日"].map((day, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{day}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
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
                      className="w-4 h-4"
                    >
                      <path d="M11 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"></path>
                      <path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4v-4c0-.5-.2-1-.6-1.4a2 2 0 0 0-1.4-.6h-2c-.5 0-1 .2-1.4.6-.4.4-.6.9-.6 1.4v4c0 .5.2 1 .6 1.4.4.4.9.6 1.4.6h.5"></path>
                      <path d="M20 17h-2"></path>
                      <path d="M15 22h5"></path>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
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
                      className="w-4 h-4"
                    >
                      <path d="m17 14 3 3 3-3"></path>
                      <path d="M22 17v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"></path>
                      <path d="m11 8 3-3 3 3"></path>
                      <path d="M14 5v9"></path>
                    </svg>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center border rounded-md p-2 bg-white">
                  <div className="w-16 h-16 bg-gray-200 rounded-md mr-3 flex-shrink-0"></div>
                  <div className="flex-grow">
                    <div className="font-medium text-sm">鶏肉と野菜の炒め物</div>
                    <div className="text-xs text-gray-500 mt-1">主菜 • 20分 • 350kcal</div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
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
                      className="w-4 h-4"
                    >
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </Button>
                </div>
                <div className="flex items-center border rounded-md p-2 bg-white">
                  <div className="w-16 h-16 bg-gray-200 rounded-md mr-3 flex-shrink-0"></div>
                  <div className="flex-grow">
                    <div className="font-medium text-sm">わかめと豆腐のお味噌汁</div>
                    <div className="text-xs text-gray-500 mt-1">副菜 • 10分 • 120kcal</div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0">
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
                      className="w-4 h-4"
                    >
                      <path d="M12 5v14"></path>
                      <path d="M5 12h14"></path>
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/plan">キャンセル</Link>
          </Button>
          <Button className="flex-1">保存</Button>
        </div>
      </main>
    </div>
  )
}
