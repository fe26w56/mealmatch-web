import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User } from '@/lib/types'
import { APP_CONFIG } from '@/lib/constants'

interface HeaderProps {
  user: User
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const userInitials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : user.email[0].toUpperCase()

  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.svg" 
            alt={APP_CONFIG.name} 
            className="h-8 w-8"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              if (target.src.includes('.svg')) {
                target.src = '/logo.png'
              } else {
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent && !parent.querySelector('.text-logo')) {
                  const textLogo = document.createElement('span')
                  textLogo.className = 'text-xl font-bold text-green-600 text-logo'
                  textLogo.textContent = APP_CONFIG.name
                  parent.appendChild(textLogo)
                }
              }
            }}
          />
          <h1 className="text-xl font-bold text-green-600">{APP_CONFIG.name}</h1>
        </div>
        <div className="flex items-center space-x-4">
          {user.role === 'admin' && (
            <Link href="/users">
              <Button variant="outline" size="sm">
                管理者ダッシュボード
              </Button>
            </Link>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name || 'ユーザー'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>設定</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
} 