import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onSearch, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearch?.(e.target.value)
      props.onChange?.(e)
    }

    return (
      <div className="relative group">
        <Search className={cn(
          "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-300",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        <input
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-lg border border-input bg-card pl-10 pr-4 text-sm",
            "transition-all duration-300 ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-primary/50 hover:shadow-md",
            "focus:border-primary focus:shadow-lg",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          {...props}
        />
        
        {/* Animated border glow */}
        <div className={cn(
          "absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-300",
          "bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0",
          isFocused && "opacity-100"
        )} />
      </div>
    )
  }
)

SearchBar.displayName = "SearchBar"

export { SearchBar }