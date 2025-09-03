import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Pill, Eye, EyeOff } from "lucide-react"
import { AnimatedInput } from "@/components/ui/animated-input"
import { AnimatedButton } from "@/components/ui/animated-button"
import apiClient from "@/api/axiosConfig"; // Import our API client
import { useToast } from "@/hooks/use-toast"; // Assuming you have a toast hook

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      localStorage.setItem('user', JSON.stringify(user));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.fullName}!`,
      });

      sendTenantIdToChatbot(user); // Send tenant ID to chatbot on login

      // Fetch dashboard data before navigating
      const dashboardData = await apiClient.get("/dashboard");

      // Navigate and pass dashboardData
      navigate("/dashboard", { state: { dashboardData: dashboardData.data } });

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function sendTenantIdToChatbot(user: any) {
    if (!user?.tenantId) return;
    await fetch("http://127.0.0.1:8000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Hello from login page!",
        tenantId: user.tenantId,
      }),
    });
  }

  return (
    <>
      {/* Add a style tag for the keyframe animation */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(20px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-float" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-0 -left-4 w-72 h-72 bg-pink-600 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 w-full max-w-md p-8 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl">
          {/* Logo and branding */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 text-white">PRISMA</h1>
            <h2 className="text-2xl font-semibold mb-2 text-gray-200">Sign in to your account</h2>
            <p className="text-gray-400">Pharmacy Management System</p>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-6 animate-slide-up">
            <div className="space-y-4">
              <AnimatedInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/20 placeholder:text-gray-400 text-white"
              />
              
              <div className="relative">
                <AnimatedInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/20 placeholder:text-gray-400 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-gray-900"
                />
                <span className="text-gray-400">Remember me</span>
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
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              loading={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </AnimatedButton>
          </form>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-400 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <p>Don't have an account? <a href="#" className="text-primary hover:text-primary/80">Register here</a></p>
          </div>
        </div>
      </div>
    </>
  )
}
