import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Aparat {
  id: number;
  nama: string;
  jabatan: string;
  instansi: string;
  kecamatan: string;
  email: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export default function AparatAdmin() {
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
      <Sidebar activeMenu="admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="pt-6 px-6 md:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Manajemen Data Aparat
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola semua data aparat pemerintahan
            </p>
          </div>

          {/* Controls */}
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:w-96 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari aparat atau kecamatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Aparat
            </Button>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Aksi
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
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
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
