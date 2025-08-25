import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Pill, Eye, EyeOff } from "lucide-react"
import { AnimatedInput } from "@/components/ui/animated-input"
import { AnimatedButton } from "@/components/ui/animated-button"

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md p-8">
        {/* Logo and branding */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2 text-primary">PRISMA</h1>
          <h2 className="text-2xl font-semibold mb-2">Sign in to your account</h2>
          <p className="text-muted-foreground">Pharmacy Management System</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-6 animate-slide-up">
          <div className="space-y-4">
            <AnimatedInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
            />
            
            <div className="relative">
              <AnimatedInput
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-muted-foreground">Remember me</span>
            </label>
            <a 
              href="#" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <AnimatedButton
            type="submit"
            variant="default"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90"
            loading={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </AnimatedButton>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <p>Don't have an account? <a href="#" className="text-primary hover:text-primary/80">Register here</a></p>
        </div>
      </div>
    </div>
  )
}