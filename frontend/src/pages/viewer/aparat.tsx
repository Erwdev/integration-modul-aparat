import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Search, Eye, Lock } from 'lucide-react';

interface Aparat {
  id: number;
  nama: string;
  jabatan: string;
  instansi: string;
  kecamatan: string;
  email: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export default function ViewerAparat() {
  const [searchQuery, setSearchQuery] = useState('');
  const [aparats] = useState<Aparat[]>([
    {
      id: 1,
      nama: 'Budi Santoso',
      jabatan: 'Camat',
      instansi: 'Kantor Camat Pusat',
      kecamatan: 'Pusat',
      email: 'budi@example.com',
      status: 'Aktif'
    },
    {
      id: 2,
      nama: 'Siti Nurhaliza',
      jabatan: 'Sekretaris Camat',
      instansi: 'Kantor Camat Pusat',
      kecamatan: 'Pusat',
      email: 'siti@example.com',
      status: 'Aktif'
    },
    {
      id: 3,
      nama: 'Ahmad Wijaya',
      jabatan: 'Staff Operasional',
      instansi: 'Kantor Camat Selatan',
      kecamatan: 'Selatan',
      email: 'ahmad@example.com',
      status: 'Aktif'
    }
  ]);

  const filteredAparats = aparats.filter(aparat =>
    aparat.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    aparat.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'Aktif'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar activeMenu="viewer" />

      <main className="flex-1 overflow-y-auto">
        <div className="pt-6 px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Lihat Data Aparat
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Tampilan read-only untuk semua data aparat
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
                Anda hanya dapat melihat data. Fitur edit dan hapus tidak tersedia. Hubungi admin untuk melakukan perubahan.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6">
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari aparat atau kecamatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-gray-950/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Jabatan
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Kecamatan
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAparats.map((aparat) => (
                    <tr
                      key={aparat.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {aparat.nama}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {aparat.jabatan}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {aparat.kecamatan}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {aparat.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(aparat.status)}`}>
                          {aparat.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Spacing */}
          <div className="pb-8"></div>
        </div>
      </main>
    </div>
  );
}
