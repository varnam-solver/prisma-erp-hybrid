import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface ModuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "orange" | "teal" | "cyan"
  href?: string
  className?: string
}

const ModuleCard = React.forwardRef<
  HTMLDivElement,
  ModuleCardProps
>(({ title, description, icon, color, href, className, ...props }, ref) => {
  
  const colorClasses = {
    blue: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
    green: "bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20",
    purple: "bg-primary-glow/10 text-primary-glow border-primary-glow/20 hover:bg-primary-glow/20",
    orange: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
    teal: "bg-[#0891b2]/10 text-[#0891b2] border-[#0891b2]/20 hover:bg-[#0891b2]/20",
    cyan: "bg-[#0284c7]/10 text-[#0284c7] border-[#0284c7]/20 hover:bg-[#0284c7]/20"
  }

  const iconColorClasses = {
    blue: "bg-primary text-primary-foreground",
    green: "bg-secondary text-secondary-foreground", 
    purple: "bg-primary-glow text-primary-foreground",
    orange: "bg-warning text-warning-foreground",
    teal: "bg-[#0891b2] text-white",
    cyan: "bg-[#0284c7] text-white"
  }

  return (
    <Card
      ref={ref}
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer group",
        "border border-border/50 hover:border-primary/30",
        className
      )}
      {...props}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-start space-y-4">
          {/* Icon */}
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg transition-colors",
            iconColorClasses[color]
          )}>
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
          
          {/* Action */}
          <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:text-primary/80 transition-colors">
            <span>Open Module</span>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </CardContent>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br from-primary to-primary-glow pointer-events-none" />
    </Card>
  )
})

ModuleCard.displayName = "ModuleCard"

export { ModuleCard }