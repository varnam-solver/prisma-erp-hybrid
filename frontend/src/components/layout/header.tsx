import * as React from "react"
import { Bell, Search, User } from "lucide-react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { SearchBar } from "@/components/ui/search-bar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  title?: string
  className?: string
}

export function Header({ title, className }: HeaderProps) {
  const [notifications] = React.useState(3) // Mock notification count

  return (
    <header className={`bg-card border-b border-border px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="flex items-center gap-4">
          {title && (
            <h1 className="text-2xl font-bold animate-fade-in">{title}</h1>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Global Search */}
          <div className="hidden md:block w-80">
            <SearchBar placeholder="Search medicines, customers..." />
          </div>

          {/* Notifications */}
          <div className="relative">
            <AnimatedButton variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
                >
                  {notifications}
                </Badge>
              )}
            </AnimatedButton>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AnimatedButton variant="ghost" size="icon" className="rounded-full hover-scale">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </AnimatedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-accent">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent">
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent">
                Team
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive hover:bg-destructive/10">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}