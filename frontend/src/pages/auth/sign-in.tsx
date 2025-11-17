import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { User, Lock, Mail, ArrowRight, Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import Logo from "@/components/ui/logo"

export default function SignInPage() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement actual API call
      console.log("Sign in data:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Berhasil masuk",
        description: "Selamat datang kembali!",
      })
      
      router.push("/aparat")
    } catch (error) {
      toast({
        title: "Gagal masuk",
        description: "Email atau password salah",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Dynamic import GSAP to avoid ESM issues
    const loadAnimations = async () => {
      try {
        const { gsap } = await import("gsap");
        
        // Animasi card masuk
        gsap.from(".login-card", {
          y: -50,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out"
        });

        // Animasi form elements stagger
        gsap.from(".animate-form-element", {
          y: 20,
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          delay: 0.3,
          ease: "power2.out"
        });
      } catch (error) {
        console.error("Failed to load GSAP:", error);
      }
    };

    loadAnimations();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors">
      {/* Background Patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-300 dark:bg-amber-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors backdrop-blur-sm"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-gray-800 dark:text-gray-200" />
          ) : (
            <Moon className="w-5 h-5 text-gray-800" />
          )}
        </button>
      </div>

      {/* Logo and Back to Home Link */}
      <div className="absolute top-4 left-4 z-20">
        <Logo size="sm" />
      </div>

      <Card className="login-card w-full max-w-md relative z-10 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-0 dark:border dark:border-gray-700">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center animate-form-element group-hover:bg-indigo-700 dark:group-hover:bg-indigo-600 transition-colors">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center animate-form-element text-gray-900 dark:text-white">
            Selamat Datang Kembali
          </CardTitle>
          <CardDescription className="text-center animate-form-element text-gray-600 dark:text-gray-300">
            Masuk ke SIAP untuk mengelola data aparat
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2 animate-form-element">
              <Label htmlFor="email" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-4 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-700"
                  required
                />
              </div>
            </div>
            <div className="space-y-2 animate-form-element">
              <Label htmlFor="password" className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
                <Lock className="w-4 h-4" />
                <span>Password</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-4 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex items-center justify-between animate-form-element">
              <div className="flex items-center space-x-2">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded transition-colors dark:bg-gray-800"
                />
                <Label htmlFor="remember_me" className="text-sm dark:text-gray-300">
                  Ingat saya
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Lupa password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors animate-form-element group"
              disabled={isLoading}
              aria-label="Sign in"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Memproses...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Masuk
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
            <div className="text-center text-sm animate-form-element">
              <span className="text-gray-600 dark:text-gray-400">Belum punya akun? </span>
              <Link
                href="/auth/sign-up"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Daftar
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}