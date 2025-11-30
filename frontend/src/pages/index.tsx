import { Button } from "@/components/ui/button";
import { ArrowRight, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/components/ui/logo";

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between py-4">
          <Logo className="shrink-0" />
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16 md:py-20 space-y-16">
        <section className="space-y-6 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-indigo-600 dark:text-indigo-400">
            Sistem Informasi Aparat
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Akses hanya untuk admin yang mengelola data aparat.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Sistem ini dirancang khusus untuk tim admin. Silakan masuk untuk melanjutkan pengelolaan data aparat.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/auth/sign-in">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}