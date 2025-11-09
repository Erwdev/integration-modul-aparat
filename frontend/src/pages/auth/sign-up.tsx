import { useState } from "react"
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Daftar Akun
          </CardTitle>
          <CardDescription className="text-center">
            Buat akun baru untuk mengakses SIAP
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                placeholder="Masukkan nama lengkap"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="konfirmasiPassword">Konfirmasi Password</Label>
              <Input
                id="konfirmasiPassword"
                type="password"
                placeholder="Masukkan ulang password"
                value={formData.konfirmasiPassword}
                onChange={(e) =>
                  setFormData({ ...formData, konfirmasiPassword: e.target.value })
                }
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
              aria-label="Sign up"
            >
              {isLoading ? "Memproses..." : "Daftar"}
            </Button>
          </CardFooter>
        </form>
        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">Sudah punya akun? </span>
          <Link
            href="/auth/sign-in"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Masuk
          </Link>
        </div>
      </Card>
    </div>
  )
}