import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Database, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import CountUp from "react-countup";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const scrambleTextRef = useRef<HTMLHeadingElement>(null);
  const footerTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register ScrambleTextPlugin
    gsap.registerPlugin(ScrambleTextPlugin);

    // Set isLoaded for other animations
    setIsLoaded(true);

    // Scramble text animation
    if (scrambleTextRef.current) {
      gsap.to(scrambleTextRef.current, {
        duration: 2,
        scrambleText: {
          text: "Data Aparat",
          chars: "0123456789",
          revealDelay: 0.5,
          speed: 0.3,
        },
      });
    }

    // Footer text reveal animation
    if (footerTextRef.current) {
      gsap.from(footerTextRef.current.children, {
        duration: 0.8,
        y: 20,
        opacity: 0,
        stagger: 0.2,
        delay: 1,
      });
    }
  }, []);

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
          <div className="flex items-center space-x-4">
            <Link href="/auth/sign-in">
              <Button variant="outline" aria-label="Login ke sistem" size="lg">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Sistem Manajemen
                <span ref={scrambleTextRef} className="text-blue-600 block">Data Aparat</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Platform terpadu untuk mengelola data aparat pemerintahan dengan efisien dan terstruktur.
              </p>
              <div className="space-x-4 pt-4">
                <Link href="/aparat">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-lg" 
                    size="lg"
                    aria-label="Mulai menggunakan sistem manajemen aparat"
                  >
                    Mulai Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 p-8">
              <div className={`bg-white p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg">Manajemen Aparat</h3>
                <p className="text-gray-600 mt-2">Kelola data aparat dengan mudah</p>
              </div>
              <div className={`bg-white p-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <Database className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg">Data Terpadu</h3>
                <p className="text-gray-600 mt-2">Basis data yang terstruktur</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div className={`p-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-4xl font-bold text-blue-600">
                  <CountUp
                    start={0}
                    end={1000}
                    duration={2.5}
                    separator=","
                    suffix="+"
                    enableScrollSpy
                    scrollSpyOnce
                  >
                    {({ countUpRef }) => (
                      <div>
                        <span ref={countUpRef} />
                      </div>
                    )}
                  </CountUp>
                </div>
                <div className="text-gray-600 mt-2">Aparat Terdaftar</div>
              </div>
              <div className={`p-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-4xl font-bold text-blue-600">
                  <CountUp
                    start={0}
                    end={24}
                    duration={2}
                    enableScrollSpy
                    scrollSpyOnce
                  >
                    {({ countUpRef }) => (
                      <div>
                        <span ref={countUpRef} />
                      </div>
                    )}
                  </CountUp>
                </div>
                <div className="text-gray-600 mt-2">Kecamatan</div>
              </div>
              <div className={`p-6 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-4xl font-bold text-blue-600">
                  <CountUp
                    start={0}
                    end={100}
                    duration={2.2}
                    suffix="+"
                    enableScrollSpy
                    scrollSpyOnce
                  >
                    {({ countUpRef }) => (
                      <div>
                        <span ref={countUpRef} />
                      </div>
                    )}
                  </CountUp>
                </div>
                <div className="text-gray-600 mt-2">Pengguna Aktif</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div ref={footerTextRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <h3 className="text-xl font-bold text-white">SIAP</h3>
              </div>
              <p className="text-sm">
                Sistem Informasi Aparat Pemerintah yang memudahkan pengelolaan data dan informasi.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Tautan Cepat</h4>
              <nav className="space-y-2">
                <Link href="/aparat" className="block hover:text-blue-400 transition-colors">
                  Data Aparat
                </Link>
                <Link href="/auth/sign-in" className="block hover:text-blue-400 transition-colors">
                  Login
                </Link>
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Kontak</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>kontak@siap.go.id</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>(021) 555-0123</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Media Sosial</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Twitter
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Facebook
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} SIAP. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}