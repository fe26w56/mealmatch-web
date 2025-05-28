import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

export function MatchingSection() {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white mb-4">
        <div className="text-center">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-3"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">レシピマッチング</h2>
          <p className="text-green-100 mb-4">
            あなたの好みに合うレシピを見つけよう！
          </p>
          <Link href="/swipe">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-50">
              <Heart className="w-5 h-5 mr-2" />
              マッチングを始める
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 