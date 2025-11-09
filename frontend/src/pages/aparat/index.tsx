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

export interface Aparat {
  nama: string;
  jabatan: string;
  nip: string;
  status: string;
}

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
    { nama: "Kevin Adelia", jabatan: "Kepala Keluarga", nip: "19870123", status: "Aktif" },
    { nama: "Garrett Hill", jabatan: "Kaur Keuangan", nip: "19890112", status: "Nonaktif" },
    { nama: "Ilham Pratama", jabatan: "Kasi Pelayanan", nip: "19900315", status: "Aktif" },
    { nama: "Kevin Sitanggang", jabatan: "Kaur Umum", nip: "19850607", status: "Aktif" },
    { nama: "John Doe", jabatan: "Kepala Desa", nip: "19820405", status: "Aktif" },
    { nama: "Jane Smith", jabatan: "Kaur TU", nip: "19880909", status: "Nonaktif" },
    { nama: "Bob Johnson", jabatan: "Kasi Kesra", nip: "19910203", status: "Aktif" },
    { nama: "Alice Brown", jabatan: "Kasi Pemerintahan", nip: "19900708", status: "Aktif" },
    { nama: "Michael Wilson", jabatan: "Kasi Kesejahteraan", nip: "19850415", status: "Aktif" },
    { nama: "Sarah Davis", jabatan: "Staff Administrasi", nip: "19920617", status: "Aktif" },
    { nama: "David Martinez", jabatan: "Staff Keuangan", nip: "19880304", status: "Nonaktif" },
    { nama: "Emily Taylor", jabatan: "Staff Pelayanan", nip: "19900829", status: "Aktif" },
    { nama: "James Anderson", jabatan: "Kepala Urusan", nip: "19870712", status: "Aktif" },
    { nama: "Linda Thomas", jabatan: "Staff TU", nip: "19891124", status: "Nonaktif" },
    { nama: "Robert White", jabatan: "Staff Kesra", nip: "19930506", status: "Aktif" },
    { nama: "Patricia Moore", jabatan: "Staff Pemerintahan", nip: "19910918", status: "Aktif" },
    { nama: "Joseph Lee", jabatan: "Kaur Perencanaan", nip: "19880731", status: "Aktif" },
    { nama: "Margaret Clark", jabatan: "Staff Perencanaan", nip: "19900203", status: "Nonaktif" },
    { nama: "Thomas Walker", jabatan: "Staff Umum", nip: "19920425", status: "Aktif" },
    { nama: "Sandra Hall", jabatan: "Staff Keuangan", nip: "19891007", status: "Aktif" },
    { nama: "Daniel Young", jabatan: "Staff Pelayanan", nip: "19930619", status: "Nonaktif" },
    { nama: "Nancy King", jabatan: "Staff Administrasi", nip: "19900112", status: "Aktif" },
    { nama: "Christopher Wright", jabatan: "Staff TU", nip: "19880845", status: "Aktif" },
    { nama: "Betty Lopez", jabatan: "Staff Kesra", nip: "19910327", status: "Aktif" },
    { nama: "George Hill", jabatan: "Staff Pemerintahan", nip: "19920709", status: "Nonaktif" },
    { nama: "George Hass", jabatan: "Staff Pemerintahan", nip: "19920009", status: "Nonaktif" }
  ]

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

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Daftar Aparat</h2>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white"
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
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex gap-4 flex-1">
            <Input 
              placeholder="Cari Aparat..." 
              className="w-1/3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <select
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Tampilkan:</span>
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
