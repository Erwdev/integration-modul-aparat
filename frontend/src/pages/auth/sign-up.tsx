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
import { useTheme } from "@/context/ThemeContext"
import { Moon, Sun, User, Mail, Lock, ArrowRight } from "lucide-react"
import Logo from "@/components/ui/logo"

export default function SignUpPage() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Ref untuk animasi
  const cardRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nama_lengkap: "", // Sesuai DTO backend
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Panggil endpoint REGISTER
      const response = await fetch(`${apiUrl}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Pendaftaran gagal');
      }

      // Jika sukses, auto login atau redirect ke login
      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Silakan masuk.",
      })
      
      router.push("/auth/sign-in")

    } catch (error: any) {
      toast({
        title: "Gagal Mendaftar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Animasi GSAP yang sama dengan Sign In
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        const { gsap } = await import("gsap");
        if (cardRef.current) {
          gsap.set(cardRef.current, { autoAlpha: 0, y: -50 });
          gsap.to(cardRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out" });
        }
      } catch (err) { console.error(err); }
    };
    loadAnimations();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors">
      {/* Background Patterns */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-300 dark:bg-amber-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          {isDarkMode ? <Sun className="w-5 h-5 text-gray-200" /> : <Moon className="w-5 h-5 text-gray-800" />}
        </button>
      </div>

      {/* Logo */}
      <div className="absolute top-4 left-4 z-20">
        <Logo size="sm" />
      </div>

      {/* CARD REGISTER */}
      <div ref={cardRef} className="w-full max-w-md relative z-10 opacity-0">
        <Card className="shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-0 dark:border dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">Buat Akun Baru</CardTitle>
            <CardDescription className="text-center">Daftar untuk mengakses sistem</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <Label htmlFor="nama" className="flex items-center space-x-2"><User className="w-4 h-4"/><span>Nama Lengkap</span></Label>
                <Input 
                  id="nama" 
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                  className="pl-4 bg-white/50 dark:bg-gray-700/50" 
                  required 
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center space-x-2"><User className="w-4 h-4"/><span>Username</span></Label>
                <Input 
                  id="username" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="pl-4 bg-white/50 dark:bg-gray-700/50" 
                  required 
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2"><Mail className="w-4 h-4"/><span>Email</span></Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-4 bg-white/50 dark:bg-gray-700/50" 
                  required 
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2"><Lock className="w-4 h-4"/><span>Password</span></Label>
                <Input 
                  id="password" 
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-4 bg-white/50 dark:bg-gray-700/50" 
                  required 
                />
              </div>

            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Daftar Sekarang"}
              </Button>
              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Sudah punya akun? </span>
                <Link href="/auth/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Masuk
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}