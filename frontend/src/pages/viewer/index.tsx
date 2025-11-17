import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Users, Database, Activity, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ViewerDashboard() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    {
      title: 'Total Aparat',
      value: '1,234',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Total Data',
      value: '2,890',
      icon: Database,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Total Laporan',
      value: '567',
      icon: Activity,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar activeMenu="viewer" />

      <main className="flex-1 overflow-y-auto">
        <div className="pt-6 px-6 md:px-8">
          {/* Header */}
          <div className={`mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Dashboard Viewer
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Lihat dan monitor data aparat (akses read-only)
            </p>
          </div>

          {/* Info Alert */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Info:</strong> Anda memiliki akses read-only. Untuk mengedit atau menghapus data, hubungi administrator.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`group bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-gray-950/50 transition-all duration-700 transform hover:scale-105 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${(index + 1) * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick View Cards */}
          <div className={`bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-950/50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '400ms' }}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Akses Data
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/viewer/aparat"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-700 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Lihat Data Aparat
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Akses read-only untuk semua data aparat
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
              <Link
                href="/viewer/reports"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-700 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      Lihat Laporan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Akses read-only untuk laporan dan statistik
                    </p>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>
            </div>
          </div>

          {/* Footer Spacing */}
          <div className="pb-8"></div>
        </div>
      </main>
    </div>
  );
}
