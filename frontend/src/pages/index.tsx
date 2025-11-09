import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header/Navigation */}
      <header className="border-b bg-white/80 backdrop-blur-sm fixed top-0 w-full z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">SIAP</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/aparat" className="text-gray-600 hover:text-blue-600 transition-colors">
              Aparat
            </Link>
            <Link href="/ekspedisi" className="text-gray-600 hover:text-blue-600 transition-colors">
              Ekspedisi
            </Link>
            <Link href="/surat" className="text-gray-600 hover:text-blue-600 transition-colors">
              Surat
            </Link>
          </nav>
          <Button variant="outline">Login</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Sistem Informasi
                <span className="text-blue-600 block">Administrasi Pemerintahan</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Kelola data aparat, ekspedisi, dan surat dengan lebih efisien. 
                Tingkatkan produktivitas administrasi pemerintahan Anda.
              </p>
              <div className="space-x-4 pt-4">
                <Link href="/aparat">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline">Pelajari Lebih Lanjut</Button>
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20">
              <div className="flex items-center justify-center h-full">
                <div className="text-4xl">🏢</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Fitur Utama</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Manajemen Aparat",
                  description: "Kelola data aparat dengan mudah dan efisien",
                  icon: "👥"
                },
                {
                  title: "Tracking Ekspedisi",
                  description: "Pantau status pengiriman dokumen secara real-time",
                  icon: "📦"
                },
                {
                  title: "Arsip Surat",
                  description: "Simpan dan kelola dokumen surat dengan aman",
                  icon: "📝"
                }
              ].map((feature, index) => (
                <div key={index} className="p-6 rounded-xl border bg-white hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "1000+", label: "Aparat Terdaftar" },
                { number: "5000+", label: "Surat Terkelola" },
                { number: "98%", label: "Tingkat Akurasi" },
                { number: "24/7", label: "Dukungan Sistem" }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Siap Untuk Memulai?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pengguna yang telah meningkatkan efisiensi
              administrasi pemerintahan mereka menggunakan SIAP.
            </p>
            <Link href="/aparat">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Mulai Sekarang
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <h1 className="text-xl font-bold text-white">SIAP</h1>
              </div>
              <p className="text-sm">
                Sistem Informasi Administrasi Pemerintahan yang memudahkan pengelolaan data.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Fitur</h3>
              <ul className="space-y-2">
                <li><Link href="/aparat" className="hover:text-white transition-colors">Aparat</Link></li>
                <li><Link href="/ekspedisi" className="hover:text-white transition-colors">Ekspedisi</Link></li>
                <li><Link href="/surat" className="hover:text-white transition-colors">Surat</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Bantuan</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Dokumentasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SIAP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}