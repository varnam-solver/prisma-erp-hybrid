import * as React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  HelpCircle,
  LogOut,
  Menu,
  X,
  Pill
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedButton } from "@/components/ui/animated-button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "New Sale", href: "/sales/new", icon: ShoppingCart },
  { name: "Buy Stock", href: "/purchases/new", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: TrendingUp },
  { name: "Help", href: "/help", icon: HelpCircle },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <div className={cn(
      "flex h-screen flex-col bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">PharmaCare</h1>
              <p className="text-xs text-muted-foreground">ERP System</p>
            </div>
          </div>
        )}
        
        <AnimatedButton
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </AnimatedButton>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item, index) => {
          const isActive = location.pathname === item.href
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-300",
                "hover:bg-accent hover:text-accent-foreground hover-scale",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground",
                isCollapsed && "justify-center px-3"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-300",
                isActive && "scale-110"
              )} />
              {!isCollapsed && (
                <span className="animate-fade-in">{item.name}</span>
              )}
              
              {/* Active indicator */}
              {isActive && !isCollapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground animate-pulse" />
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/login"
          className={cn(
            "flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-300",
            "text-destructive hover:bg-destructive/10 hover-scale",
            isCollapsed && "justify-center px-3"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </NavLink>
      </div>
    </div>
  )
}