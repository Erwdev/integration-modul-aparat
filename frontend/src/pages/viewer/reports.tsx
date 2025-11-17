import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { BarChart3, TrendingUp, Lock, Eye } from 'lucide-react';

export default function ViewerReports() {
  const [reportData] = useState([
    {
      id: 1,
      title: 'Laporan Bulanan Aparat',
      month: 'November 2024',
      totalAparat: 1234,
      activeAparat: 1200,
      inactiveAparat: 34,
      trend: '+5.2%'
    },
    {
      id: 2,
      title: 'Laporan Kinerja Operasional',
      month: 'November 2024',
      totalTasks: 567,
      completedTasks: 523,
      pendingTasks: 44,
      trend: '+8.1%'
    },
    {
      id: 3,
      title: 'Laporan Distribusi Regional',
      month: 'November 2024',
      totalRegions: 12,
      activeRegions: 11,
      inactiveRegions: 1,
      trend: '+2.3%'
    }
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar activeMenu="viewer" />

      <main className="flex-1 overflow-y-auto">
        <div className="pt-6 px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Lihat Laporan
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Tampilan read-only untuk laporan dan statistik sistem
            </p>
          </div>

          {/* Permission Info */}
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Akses Read-Only
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                Anda dapat melihat laporan dan statistik. Download dan export tidak tersedia pada akses viewer.
              </p>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {reportData.map((report, index) => (
              <div
                key={report.id}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-950/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {report.month}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                      {report.trend}
                    </span>
                  </div>
                </div>

                {/* Report Stats */}
                <div className="space-y-3">
                  {index === 0 && (
                    <>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Aparat</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{report.totalAparat}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Aparat Aktif</span>
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">{report.activeAparat}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Aparat Tidak Aktif</span>
                        <span className="text-lg font-semibold text-red-600 dark:text-red-400">{report.inactiveAparat}</span>
                      </div>
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Tugas</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{report.totalTasks}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tugas Selesai</span>
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">{report.completedTasks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Tugas Pending</span>
                        <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">{report.pendingTasks}</span>
                      </div>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Region</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">{report.totalRegions}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Region Aktif</span>
                        <span className="text-lg font-semibold text-green-600 dark:text-green-400">{report.activeRegions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Region Tidak Aktif</span>
                        <span className="text-lg font-semibold text-red-600 dark:text-red-400">{report.inactiveRegions}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* View Button */}
                <button className="w-full mt-4 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Lihat Detail</span>
                </button>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 Informasi Penting
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li>• Anda dapat melihat semua laporan dan statistik sistem</li>
              <li>• Data ditampilkan real-time dari server</li>
              <li>• Untuk mendapatkan akses edit atau membuat laporan, hubungi administrator</li>
              <li>• Fitur export dan print akan tersedia untuk akun admin dan operator</li>
            </ul>
          </div>

          {/* Footer Spacing */}
          <div className="pb-8"></div>
        </div>
      </main>
    </div>
  );
}
