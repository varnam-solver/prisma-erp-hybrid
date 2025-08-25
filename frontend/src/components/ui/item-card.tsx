import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Badge } from "@/components/ui/badge"

interface ItemCardProps {
  title: string
  subtitle?: string
  description?: string
  image?: string
  price?: string
  status?: "in-stock" | "low-stock" | "out-of-stock"
  category?: string
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  className?: string
  delay?: number
}

const ItemCard = React.forwardRef<HTMLDivElement, ItemCardProps>(
  ({ 
    title, 
    subtitle, 
    description, 
    image, 
    price, 
    status = "in-stock", 
    category,
    onEdit, 
    onDelete, 
    onView,
    className,
    delay = 0,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    }, [delay])

    const statusConfig = {
      "in-stock": { 
        badge: "In Stock", 
        variant: "default" as const,
        color: "bg-success" 
      },
      "low-stock": { 
        badge: "Low Stock", 
        variant: "secondary" as const,
        color: "bg-warning" 
      },
      "out-of-stock": { 
        badge: "Out of Stock", 
        variant: "destructive" as const,
        color: "bg-destructive" 
      }
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "group relative overflow-hidden transition-all duration-500 hover-lift hover-glow card-gradient",
          "cursor-pointer border-0 shadow-sm hover:shadow-xl",
          isVisible ? "animate-scale-in" : "opacity-0 scale-95",
          className
        )}
        onClick={onView}
        {...props}
      >
        {/* Image */}
        {image && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img 
              src={image} 
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg leading-none tracking-tight group-hover:text-primary transition-colors duration-300">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            
            {/* Status indicator */}
            <div className={cn(
              "h-3 w-3 rounded-full",
              statusConfig[status].color
            )} />
          </div>

          {/* Category and Status */}
          <div className="flex items-center gap-2 pt-2">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
            <Badge variant={statusConfig[status].variant} className="text-xs">
              {statusConfig[status].badge}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
          )}
          
          {price && (
            <div className="text-2xl font-bold text-primary">
              {price}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 gap-2">
          {onEdit && (
            <AnimatedButton
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="flex-1"
            >
              Edit
            </AnimatedButton>
          )}
          {onDelete && (
            <AnimatedButton
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="flex-1"
            >
              Delete
            </AnimatedButton>
          )}
        </CardFooter>

        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br from-primary via-transparent to-secondary pointer-events-none" />
      </Card>
    )
  }
)

ItemCard.displayName = "ItemCard"

export { ItemCard }