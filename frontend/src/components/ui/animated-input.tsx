import * as React from "react"
import { cn } from "@/lib/utils"

export interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setIsFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
    }

    return (
      <div className="relative group">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg border border-input bg-card px-4 pt-4 pb-2 text-sm transition-all duration-300",
            "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "hover:border-primary/50 hover:shadow-md",
            isFocused && "border-primary shadow-lg",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {label && (
          <label
            className={cn(
              "absolute left-4 top-3 text-sm text-muted-foreground transition-all duration-300 pointer-events-none",
              (isFocused || hasValue) && "top-1 text-xs text-primary font-medium",
              error && "text-destructive"
            )}
          >
            {label}
          </label>
        )}
        {error && (
          <p className="mt-1 text-xs text-destructive animate-slide-up">{error}</p>
        )}
      </div>
    )
  }
)

AnimatedInput.displayName = "AnimatedInput"

export { AnimatedInput }