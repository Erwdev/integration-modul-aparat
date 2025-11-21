import { useState, useEffect, useRef } from "react"
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
import { User, Lock, ArrowRight, Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import Logo from "@/components/ui/logo"

export default function SignInPage() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // REF untuk animasi GSAP
  const cardRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  // --- LOGIKA LOGIN (TETAP PAKE YANG BENAR) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast({
        title: "Berhasil masuk",
        description: `Selamat datang kembali, ${data.user?.nama_lengkap || formData.username}!`,
      })
      
      router.push("/aparat")
    } catch (error: any) {
      toast({
        title: "Gagal masuk",
        description: error.message || "Periksa username dan password Anda",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // --- ANIMASI GSAP (DIKEMBALIKAN) ---
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const { gsap } = await import("gsap");
        
        // Pastikan elemen ada sebelum dianimasikan
        if (cardRef.current) {
          // Set initial state (supaya tidak blank jika animasi macet)
          gsap.set(cardRef.current, { autoAlpha: 0, y: -50 });
          gsap.set(".animate-form-element", { autoAlpha: 0, y: 20 });

          // Jalankan animasi
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          
          tl.to(cardRef.current, {
            autoAlpha: 1, // autoAlpha lebih aman daripada opacity
            y: 0,
            duration: 0.8
          })
          .to(".animate-form-element", {
            autoAlpha: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.5
          }, "-=0.4");
        }
      } catch (error) {
        console.error("GSAP Error:", error);
        // Fallback jika GSAP gagal load: paksa elemen muncul
        if (cardRef.current) {
            cardRef.current.style.opacity = "1";
            cardRef.current.style.transform = "none";
        }
      }
    };

    loadAnimations();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors">
      {/* Background Patterns (Design Asli) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-300 dark:bg-amber-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 transition-colors backdrop-blur-sm">
          {isDarkMode ? <Sun className="w-5 h-5 text-gray-200" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>

      {/* Logo */}
      <div className="absolute top-4 left-4 z-20">
        <Logo size="sm" />
      </div>

      {/* CARD LOGIN (Design Glassmorphism) */}
      <div ref={cardRef} className="login-card w-full max-w-md relative z-10 opacity-0"> 
        <Card className="shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-0 dark:border dark:border-gray-700">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center animate-form-element">
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
              {/* INPUT USERNAME */}
              <div className="space-y-2 animate-form-element">
                <Label htmlFor="username" className="flex items-center space-x-2">
                  <User className="w-4 h-4" /> <span>Username</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="pl-4 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  required
                />
              </div>
              {/* INPUT PASSWORD */}
              <div className="space-y-2 animate-form-element">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" /> <span>Password</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-4 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  required
                />
              </div>
              <div className="flex items-center justify-between animate-form-element">
                <div className="flex items-center space-x-2">
                  <input id="remember_me" type="checkbox" className="h-4 w-4 text-indigo-600 rounded" />
                  <Label htmlFor="remember_me" className="text-sm">Ingat saya</Label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Lupa password?
                </Link>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 animate-form-element group" disabled={isLoading}>
                {isLoading ? "Memproses..." : (
                  <div className="flex items-center justify-center">
                    Masuk <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </Button>
              <div className="text-center text-sm animate-form-element">
                <span className="text-gray-600 dark:text-gray-400">Belum punya akun? </span>
                <Link href="/auth/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Daftar
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}