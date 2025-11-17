import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Users, Database, Activity, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
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
      title: 'Total Pengguna',
      value: '456',
      icon: Users,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      title: 'Data Integrasi',
      value: '789',
      icon: Database,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Aktivitas Hari Ini',
      value: '234',
      icon: Activity,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar activeMenu="admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="pt-6 px-6 md:px-8">
          {/* Header */}
          <div className={`mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola sistem dan monitor aktivitas pengguna
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Quick Actions */}
          <div className={`bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-950/50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '500ms' }}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Akses Cepat
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/users"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Manajemen Pengguna
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kelola akun pengguna dan permission
                </p>
              </Link>
              <Link
                href="/admin/aparat"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Data Aparat
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Kelola data aparat keseluruhan
                </p>
              </Link>
              <Link
                href="/admin/settings"
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors group"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Pengaturan Sistem
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Konfigurasi dan preferensi sistem
                </p>
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
