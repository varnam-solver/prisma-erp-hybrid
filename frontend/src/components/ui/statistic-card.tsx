import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatisticCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
  className?: string
  delay?: number
}

const StatisticCard = React.forwardRef<
  HTMLDivElement,
  StatisticCardProps
>(({ title, value, change, changeType = "neutral", icon, className, delay = 0, ...props }, ref) => {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    return () => clearTimeout(timer)
  }, [delay])

  const changeColorClass = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground"
  }[changeType]

  return (
    <Card
      ref={ref}
      className={cn(
        "relative overflow-hidden transition-all duration-500 hover-lift hover-glow card-gradient",
        isVisible ? "animate-scale-in" : "opacity-0 scale-95",
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={cn("text-xs", changeColorClass)}>
            {change}
          </p>
        )}
      </CardContent>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br from-primary to-secondary pointer-events-none" />
    </Card>
  )
})

StatisticCard.displayName = "StatisticCard"

export { StatisticCard }