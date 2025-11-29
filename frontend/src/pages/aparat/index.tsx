import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"
import Sidebar from "@/components/layout/Sidebar"
import AparatTable from "@/features/aparat/components/AparatTable"
import AddAparatModal from "@/features/aparat/components/AddAparatModal"
import EditAparatModal from "@/features/aparat/components/EditAparatModal"
import Pagination from "@/components/ui/Pagination"
import type { AparatFormData } from "@/features/aparat/components/AddAparatModal"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import type { Aparat } from '@/types/aparat';

const AparatPage = () => {
  const { toast } = useToast();

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAparat, setSelectedAparat] = useState<Aparat | null>(null);

  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Apply dark mode class to body for full-page dark mode
    document.body.className = isDarkMode
      ? 'bg-gray-900 text-gray-100' 
      : 'bg-gray-50 text-gray-900';
  }, [isDarkMode]); // Update when dark mode changes

  // Data
  const aparatData: Aparat[] = [
    {
      id: "1",
      nomorUrut: 1,
      nama: "John Doe",
      nip: "19820405",
      jenisKelamin: "L",
      tempatLahir: "Jakarta",
      tanggalLahir: "1982-04-05",
      agama: "Islam",
      pangkatGolongan: "III/a",
      jabatan: "Kepala Desa",
      pendidikanTerakhir: "S1 Administrasi Publik",
      skPengangkatan: {
        nomor: "821.2/001/2020",
        tanggal: "2020-01-01"
      },
      status: "Aktif"
    },
    {
      id: "2",
      nomorUrut: 2,
      nama: "Jane Smith",
      nip: "19880909",
      jenisKelamin: "P",
      tempatLahir: "Bandung",
      tanggalLahir: "1988-09-09",
      agama: "Islam",
      pangkatGolongan: "II/c",
      jabatan: "Kaur TU",
      pendidikanTerakhir: "D3 Manajemen",
      skPengangkatan: {
        nomor: "821.2/002/2020",
        tanggal: "2020-01-02"
      },
      skPemberhentian: {
        nomor: "821.2/045/2023",
        tanggal: "2023-12-31"
      },
      status: "Nonaktif"
    },
    {
      id: "3",
      nomorUrut: 3,
      nama: "Ilham Pratama",
      nip: "19900315",
      jenisKelamin: "L",
      tempatLahir: "Surabaya",
      tanggalLahir: "1990-03-15",
      agama: "Islam",
      jabatan: "Kasi Pelayanan",
      pendidikanTerakhir: "S1 Ilmu Pemerintahan",
      skPengangkatan: {
        nomor: "821.2/003/2020",
        tanggal: "2020-01-03"
      },
      status: "Aktif"
    },
    {
      id: "4",
      nomorUrut: 4,
      nama: "Sarah Davis",
      nip: "19920617",
      jenisKelamin: "P",
      tempatLahir: "Medan",
      tanggalLahir: "1992-06-17",
      agama: "Kristen",
      jabatan: "Staff Administrasi",
      pendidikanTerakhir: "S1 Administrasi",
      skPengangkatan: {
        nomor: "821.2/004/2020",
        tanggal: "2020-01-04"
      },
      status: "Aktif",
      keterangan: "Penghargaan Pegawai Teladan 2022"
    },
    {
      id: "5",
      nomorUrut: 5,
      nama: "Kevin Adelia",
      nip: "19870123",
      jenisKelamin: "L",
      tempatLahir: "Semarang",
      tanggalLahir: "1987-01-23",
      agama: "Islam",
      jabatan: "Kepala Urusan Keuangan",
      pendidikanTerakhir: "S1 Akuntansi",
      skPengangkatan: {
        nomor: "821.2/005/2020",
        tanggal: "2020-01-05"
      },
      status: "Aktif"
    }
  ];

  const handleAddAparat = (newData: AparatFormData) => {
    // TODO: Implement add aparat functionality with API call
    console.log('New aparat data:', newData);
    toast({
      title: "Berhasil menambah aparat",
      description: `Aparat ${newData.nama} telah berhasil ditambahkan.`,
    });
  };

  const handleEditAparat = (updatedData: Aparat) => {
    // TODO: Implement edit aparat functionality with API call
    console.log('Updated aparat data:', updatedData);
    toast({
      title: "Berhasil mengubah data aparat",
      description: `Data aparat ${updatedData.nama} telah berhasil diperbarui.`,
    });
    setIsEditModalOpen(false);
  };

  const handleDeleteAparat = (aparat: Aparat) => {
    // TODO: Implement delete aparat functionality with API call
    console.log('Deleting aparat:', aparat);
    toast({
      title: "Berhasil menghapus aparat",
      description: `Aparat ${aparat.nama} telah berhasil dihapus.`,
    });
    setIsDeleteDialogOpen(false);
  };

  const onEdit = (aparat: Aparat) => {
    setSelectedAparat(aparat);
    setIsEditModalOpen(true);
  };

  const onDelete = (aparat: Aparat) => {
    setSelectedAparat(aparat);
    setIsDeleteDialogOpen(true);
  };

  // Filtering
  const filteredData = aparatData.filter((aparat: Aparat) => {
    const matchesSearch = aparat.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aparat.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aparat.nip.includes(searchTerm);
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && aparat.status === filterStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar activeMenu="aparat" />

      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Daftar Aparat</h2>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white w-full sm:w-auto text-sm md:text-base"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Tambah Aparat
          </Button>
        </div>

        <AddAparatModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAparat}
        />

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Input 
              placeholder="Cari Aparat..." 
              className="w-full sm:w-80 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Tampilkan:</span>
            <select
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">data</span>
          </div>
        </div>

        <AparatTable 
          data={paginatedData}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {/* Edit Modal */}
        <EditAparatModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditAparat}
          aparat={selectedAparat}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-gray-900 dark:text-white">Hapus Aparat</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                Apakah Anda yakin ingin menghapus data aparat {selectedAparat?.nama}? 
                Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600">
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedAparat && handleDeleteAparat(selectedAparat)}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={Math.min(startIndex + itemsPerPage, filteredData.length)}
          totalItems={filteredData.length}
          onPageChange={setCurrentPage}
        />
      </main>
      <Toaster />
    </div>
  );
};

export default AparatPage;
