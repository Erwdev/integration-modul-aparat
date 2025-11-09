import { useTheme } from '@/context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/outline';
import Logo from '@/components/ui/logo';

interface SidebarProps {
  activeMenu?: 'aparat' | 'ekspedisi' | 'surat';
}

const Sidebar = ({ activeMenu = 'aparat' }: SidebarProps) => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 shadow-md px-4 py-6 transition-colors">
      <div className="flex justify-between items-center mb-8">
        <Logo size="md" />
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
      </div>
      <nav className="space-y-2">
        <p className="text-gray-400 dark:text-gray-500 uppercase text-xs">Data Management</p>
        <ul className="space-y-2">
          <li className={`${
            activeMenu === 'aparat' 
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30' 
              : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400'
            } px-2 py-1 rounded-md cursor-pointer transition-colors`}>
            Aparat
          </li>
          <li className={`${
            activeMenu === 'ekspedisi' 
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30' 
              : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400'
            } px-2 py-1 rounded-md cursor-pointer transition-colors`}>
            Ekspedisi
          </li>
          <li className={`${
            activeMenu === 'surat' 
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30' 
              : 'text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400'
            } px-2 py-1 rounded-md cursor-pointer transition-colors`}>
            Surat
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;