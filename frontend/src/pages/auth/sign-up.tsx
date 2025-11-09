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
import { useTheme } from "@/context/ThemeContext"
import { Moon, Sun } from "lucide-react"
import Logo from "@/components/ui/logo"
import { gsap } from "gsap"

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    konfirmasiPassword: "",
  })

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(formData.email)) {
      toast({
        title: "Email tidak valid",
        description: "Mohon masukkan alamat email yang valid",
        variant: "destructive",
      })
      return
    }
    
    if (formData.password !== formData.konfirmasiPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Password dan konfirmasi password harus sama",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password terlalu pendek",
        description: "Password harus minimal 8 karakter",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // TODO: Implement actual API call
      console.log("Sign up data:", formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Berhasil mendaftar",
        description: "Silahkan masuk dengan akun baru Anda",
      })
      
      router.push("/auth/sign-in")
    } catch (error) {
      toast({
        title: "Gagal mendaftar",
        description: "Terjadi kesalahan saat mendaftar",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const { isDarkMode, toggleDarkMode } = useTheme()

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors">
      {/* Logo */}
      <div className="absolute top-4 left-4 z-20">
        <Logo size="sm" />
      </div>

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

      <Card className="w-full max-w-md relative z-10 login-card bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-800/50 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center dark:text-white">
            Daftar Akun
          </CardTitle>
          <CardDescription className="text-center dark:text-gray-300">
            Buat akun baru untuk mengakses SIAP
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2 animate-form-element">
              <Label htmlFor="nama" className="text-gray-700 dark:text-gray-200">Nama Lengkap</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama lengkap"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                required
              />
            </div>
            <div className="space-y-2 animate-form-element">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                required
              />
            </div>
            <div className="space-y-2 animate-form-element">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2 animate-form-element">
              <Label htmlFor="konfirmasiPassword" className="text-gray-700 dark:text-gray-200">Konfirmasi Password</Label>
              <Input
                id="konfirmasiPassword"
                type="password"
                placeholder="Masukkan ulang password"
                value={formData.konfirmasiPassword}
                onChange={(e) =>
                  setFormData({ ...formData, konfirmasiPassword: e.target.value })
                }
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
              disabled={isLoading}
              aria-label="Sign up"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                  Memproses...
                </div>
              ) : (
                "Daftar"
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sudah punya akun? </span>
          <Link
            href="/auth/sign-in"
            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            Masuk
          </Link>
        </div>
      </Card>
    </div>
  )
}