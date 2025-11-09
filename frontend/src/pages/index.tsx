import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Database, Mail, Phone, MapPin, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import CountUp from "react-countup";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/ui/logo";

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

  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors">
      {/* Header/Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm fixed top-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex-1">
              <Link href="/" className="flex items-center space-x-2 group w-fit">
                <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 dark:group-hover:bg-indigo-600 transition-colors">
                  <span className="text-white font-bold">S</span>
                </div>
                <div className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">SIAP</div>
              </Link>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-24">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                Sistem Manajemen
                <span ref={scrambleTextRef} className="text-indigo-600 dark:text-indigo-300 block mt-2">Data Aparat</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-200 leading-relaxed max-w-2xl">
                Platform terpadu untuk mengelola data aparat pemerintahan dengan efisien dan terstruktur.
              </p>
              <div className="flex space-x-4 pt-6">
                <Link href="/auth/sign-in" className="group">
                  <Button variant="outline" 
                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-lg transform transition-all duration-200 hover:scale-105" 
                    size="lg">
                    <span className="group-hover:translate-x-1 transition-transform">Login</span>
                  </Button>
                </Link>
                <Link href="/aparat" className="group">
                  <Button 
                    className="bg-amber-500 dark:bg-amber-500 hover:bg-amber-600 dark:hover:bg-amber-600 text-white dark:text-gray-950 text-lg transform transition-all duration-200 hover:scale-105" 
                    size="lg"
                    aria-label="Mulai menggunakan sistem manajemen aparat"
                  >
                    <span className="group-hover:translate-x-1 transition-transform inline-flex items-center">
                      Mulai Sekarang
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6">
              <div className={`group bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg dark:shadow-gray-950/50 transform hover:scale-105 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all duration-500 relative overflow-hidden ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-600/10 rounded-t-2xl"></div>
                <div className="relative">
                  <div className="absolute -top-1 -left-1 w-16 h-16 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full transform -translate-x-1/4 -translate-y-1/4"></div>
                  <Users className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3 transform group-hover:scale-110 transition-transform duration-500 relative z-10" />
                </div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">Manajemen Aparat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 relative z-10">Kelola data aparat dengan mudah dan efisien</p>
              </div>
              <div className={`group bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg dark:shadow-gray-950/50 transform hover:scale-105 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all duration-500 delay-200 relative overflow-hidden ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-600/10 rounded-t-2xl"></div>
                <div className="relative">
                  <div className="absolute -top-1 -left-1 w-16 h-16 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full transform -translate-x-1/4 -translate-y-1/4"></div>
                  <Database className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-3 transform group-hover:scale-110 transition-transform duration-500 relative z-10" />
                </div>
                <h3 className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">Data Terpadu</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 relative z-10">Basis data yang terstruktur dan terintegrasi</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white dark:bg-gray-900 py-20 transition-colors relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/30 opacity-50"></div>
          <div className="container mx-auto px-4 relative">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div className={`group p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700/50 transition-all duration-700 delay-300 transform hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  <CountUp
                    start={0}
                    end={1000}
                    duration={2.2}
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
                <div className="text-gray-600 dark:text-gray-300 mt-3 text-lg font-medium">Aparat Terdaftar</div>
              </div>
              <div className={`group p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700/50 transition-all duration-700 delay-400 transform hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                  <CountUp
                    start={0}
                    end={24}
                    duration={2.2}
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
                <div className="text-gray-600 dark:text-gray-300 mt-3 text-lg font-medium">Kecamatan</div>
              </div>
              <div className={`group p-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700/50 transition-all duration-700 delay-500 transform hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
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
                <div className="text-gray-600 dark:text-gray-300 mt-3 text-lg font-medium">Pengguna Aktif</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div ref={footerTextRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <h3 className="text-xl font-bold text-white">SIAP</h3>
              </div>
              <p className="text-sm text-gray-300 dark:text-gray-400">
                Sistem Informasi Aparat Pemerintah yang memudahkan pengelolaan data dan informasi.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Tautan Cepat</h4>
              <nav className="space-y-2">
                <Link href="/aparat" className="block hover:text-indigo-400 transition-colors">
                  Data Aparat
                </Link>
                <Link href="/auth/sign-in" className="block hover:text-indigo-400 transition-colors">
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
                <a href="#" className="hover:text-indigo-400 transition-colors">
                  Twitter
                </a>
                <a href="#" className="hover:text-indigo-400 transition-colors">
                  Facebook
                </a>
                <a href="#" className="hover:text-indigo-400 transition-colors">
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