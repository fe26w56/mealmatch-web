import { User } from '@/lib/types'

interface WelcomeSectionProps {
  user: User
}

export function WelcomeSection({ user }: WelcomeSectionProps) {
  return (
    <div className="mb-6">
      <div className="bg-white rounded-lg p-6 border mb-6">
        <h2 className="text-lg font-semibold mb-2">
          ようこそ、{user.name || 'ユーザー'}さん！
        </h2>
        <p className="text-gray-600">
          MealMatchで素敵な食事プランを作成しましょう。
        </p>
      </div>
    </div>
  )
} 