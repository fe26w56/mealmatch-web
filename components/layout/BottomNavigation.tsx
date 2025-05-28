import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChefHat, Heart, Home, Calendar } from "lucide-react"
import { NAVIGATION_ITEMS } from '@/lib/constants'

const iconMap = {
  Home,
  Heart,
  ChefHat,
  Calendar,
} as const

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <footer className="sticky bottom-0 border-t bg-white">
      <div className="grid grid-cols-4 h-16">
        {NAVIGATION_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href
          const IconComponent = iconMap[icon as keyof typeof iconMap]
          
          return (
            <Link 
              key={href}
              href={href} 
              className={`flex flex-col items-center justify-center ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          )
        })}
      </div>
    </footer>
  )
} 