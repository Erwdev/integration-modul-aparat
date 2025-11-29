import { useTheme } from '@/context/ThemeContext';
import { 
  MoonIcon, 
  SunIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Bars3Icon, 
  XMarkIcon,
  UserGroupIcon, 
  TruckIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  ArrowLeftOnRectangleIcon // ✅ Icon Logout
} from '@heroicons/react/24/outline';
import Logo from '@/components/ui/logo';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router'; // ✅ Router untuk redirect

interface SidebarProps {
  activeMenu?: 'aparat' | 'ekspedisi' | 'surat' | 'reports' | 'events';
}

const Sidebar = ({ activeMenu = 'aparat' }: SidebarProps) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter(); // ✅ Init Router

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (!isMobileView) {
        setIsMobileMenuOpen(false);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Reset collapse state when switching between mobile and desktop
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(false);
    }
  }, [isMobile]);

  // ✅ Fungsi Logout
  const handleLogout = () => {
    // 1. Hapus data sesi
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 2. Redirect ke halaman login
    router.push('/auth/sign-in');
  };

  const menuItems = [
    {
      href: '/aparat',
      label: 'Aparat',
      icon: UserGroupIcon,
      value: 'aparat'
    },
    {
      href: '/ekspedisi',
      label: 'Ekspedisi',
      icon: TruckIcon,
      value: 'ekspedisi'
    },
    {
      href: '/surat',
      label: 'Surat',
      icon: DocumentTextIcon,
      value: 'surat'
    },
    {
      href: '/reports',
      label: 'Laporan',
      icon: ChartBarIcon,
      value: 'reports'
    },
    // Tambahkan menu events/audit log jika sudah ada di sidebar sebelumnya
    {
      href: '/events',
      label: 'Audit Log',
      icon: ChartBarIcon, // Bisa ganti icon lain jika mau
      value: 'events'
    }
  ];

  return (
    <div className="min-h-screen print:hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "bg-white dark:bg-gray-900 shadow-md py-6 transition-all duration-300 ease-in-out relative h-screen flex flex-col", // ✅ Added flex flex-col
          // Mobile styles
          "fixed md:static inset-y-0 left-0 z-40 md:z-0",
          "transform md:transform-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop styles
          !isMobile && "group hover:shadow-lg",
          !isMobile && (isCollapsed ? "w-[72px]" : "w-64")
        )}
      >
      {/* Collapse Button - Only shown on desktop */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-12 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      )}

      {/* Header Logo & Theme Toggle (Desktop Expanded / Mobile) */}
      <div className={cn(
        "flex items-center mb-8 transition-all",
        isCollapsed && !isMobile ? "justify-center px-2" : "justify-between px-4"
      )}>
        <div className={cn(
          "transition-all duration-300",
          isCollapsed && !isMobile && "scale-75 origin-left"
        )}>
          <Logo size={isCollapsed && !isMobile ? "sm" : "md"} />
        </div>
        {(!isCollapsed || isMobile) && (
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <SunIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <MoonIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Menu Items */}
      <nav className={cn("space-y-2 flex-1 overflow-y-auto", isCollapsed && !isMobile ? "px-2" : "px-4")}>
        {(!isCollapsed || isMobile) && (
          <p className="text-gray-400 dark:text-gray-500 uppercase text-xs mb-2 font-medium">Data Management</p>
        )}
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <Link href={item.href} key={item.value} onClick={() => isMobile && setIsMobileMenuOpen(false)}>
              <li className={cn(
                "rounded-md cursor-pointer transition-colors flex items-center gap-3",
                isCollapsed && !isMobile ? "justify-center p-2" : "px-3 py-2",
                activeMenu === item.value
                  ? "text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30"
                  : "text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}>
                <item.icon className={cn(
                  "transition-all",
                  isCollapsed && !isMobile ? "w-6 h-6" : "w-5 h-5"
                )} />
                {(!isCollapsed || isMobile) && <span>{item.label}</span>}
              </li>
            </Link>
          ))}
        </ul>
      </nav>

      {/* ✅ Logout Button (Footer) */}
      <div className={cn(
        "p-4 border-t border-gray-200 dark:border-gray-800 mt-auto",
        // Jika collapsed, beri margin bawah agar tidak tertutup tombol tema absolute
        isCollapsed && !isMobile ? "mb-16 px-2" : "mb-0 px-4"
      )}>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 w-full rounded-md cursor-pointer transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
             isCollapsed && !isMobile ? "justify-center p-2" : "px-3 py-2"
          )}
          title="Keluar Aplikasi"
        >
           <ArrowLeftOnRectangleIcon className={cn(
              "transition-all",
              isCollapsed && !isMobile ? "w-6 h-6" : "w-5 h-5"
            )} />
            {(!isCollapsed || isMobile) && <span className="font-medium">Keluar</span>}
        </button>
      </div>

      {/* Collapsed Theme Toggle (Absolute Bottom) */}
      {isCollapsed && !isMobile && (
        <button
          onClick={toggleDarkMode}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-500" />
          )}
        </button>
      )}
    </aside>
    </div>
  );
};

export default Sidebar;