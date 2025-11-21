import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "@/components/layout/Sidebar";
import AparatTable from "@/features/aparat/components/AparatTable";
import AddAparatModal from "@/features/aparat/components/AddAparatModal";
import EditAparatModal from "@/features/aparat/components/EditAparatModal";
import DetailAparatModal from "@/features/aparat/components/DetailAparatModal";
import Pagination from "@/components/ui/Pagination";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ✅ IMPORT DARI TYPES & HOOKS (Bukan data dummy)
import type { Aparat, AparatFormData } from '@/features/aparat/types';
import { useAparatList } from "@/features/aparat/hooks/useAparatList"; // Hook Data Asli
import { createAparat, updateAparat, deleteAparat } from "@/features/aparat/api/aparatApi";

const AparatPage = () => {
  const { toast } = useToast();
  
  // ✅ PANGGIL DATA DARI DATABASE
  const { aparatList, isLoading, error, refetch } = useAparatList();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAparat, setSelectedAparat] = useState<Aparat | null>(null);

  const { isDarkMode } = useTheme();

  useEffect(() => {
    document.body.className = isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  }, [isDarkMode]);

  // --- HANDLER FUNGSI (CRUD) ---

  const handleAddAparat = async (newData: AparatFormData) => {
    try {
      await createAparat(newData);
      refetch(); // Reload data tabel
      toast({ title: "Berhasil", description: `Aparat ${newData.nama} berhasil ditambahkan.` });
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const handleEditAparat = async (updatedData: Aparat) => {
    try {
      await updateAparat(updatedData.id, updatedData);
      refetch(); // Reload data tabel
      toast({ title: "Berhasil", description: "Data berhasil diperbarui." });
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteAparat = async (aparat: Aparat) => {
    try {
      await deleteAparat(aparat.id);
      refetch(); // Reload data tabel
      toast({ title: "Berhasil", description: "Data berhasil dihapus." });
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.message, variant: "destructive" });
    }
  };

  const onEdit = (aparat: Aparat) => {
    setSelectedAparat(aparat);
    setIsEditModalOpen(true);
  };

  const onDelete = (aparat: Aparat) => {
    setSelectedAparat(aparat);
    setIsDeleteDialogOpen(true);
  };

  const onView = (aparat: Aparat) => {
    setSelectedAparat(aparat);
    setIsDetailModalOpen(true);
  };

  // --- FILTERING DATA ASLI ---
  // Gunakan aparatList (dari API), bukan aparatData (Dummy)
  const filteredData = aparatList.filter((aparat: Aparat) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (aparat.nama?.toLowerCase() || '').includes(searchLower) ||
                         (aparat.jabatan?.toLowerCase() || '').includes(searchLower) ||
                         (aparat.nip || '').includes(searchTerm);
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && aparat.status?.toUpperCase() === filterStatus.toUpperCase();
  });

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
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Input 
              placeholder="Cari Aparat..." 
              className="w-full sm:w-80 bg-white dark:bg-gray-800" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <select
              className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Semua Status</option>
              <option value="AKTIF">Aktif</option>
              <option value="NONAKTIF">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* ✅ TAMPILKAN LOADING STATE / DATA ASLI */}
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">Error: {error}</div>
        ) : (
          <AparatTable 
            data={paginatedData}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        )}

        <EditAparatModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditAparat}
          aparat={selectedAparat}
        />

        <DetailAparatModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          aparat={selectedAparat}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-white dark:bg-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Aparat</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus data {selectedAparat?.nama}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => selectedAparat && handleDeleteAparat(selectedAparat)} className="bg-red-600 text-white">
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