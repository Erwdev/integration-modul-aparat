import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Eye } from "lucide-react";
import type { Aparat } from "@/features/aparat/types"; // Update import path
import { format, isValid } from "date-fns";
import { id } from "date-fns/locale";

interface AparatTableProps {
  data: Aparat[];
  onEdit: (aparat: Aparat) => void;
  onDelete: (aparat: Aparat) => void;
  onView: (aparat: Aparat) => void; // TAMBAHAN BARU
}

// Helper Format Date Aman
const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return isValid(date) ? format(date, 'dd MMMM yyyy', { locale: id }) : '-';
};

const AparatTable = ({ data, onEdit, onDelete, onView }: AparatTableProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/30 rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-900/50">
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">No.</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Nama Lengkap</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">NIP/NIAPD</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">L/P</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">TTL</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Agama</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Jabatan</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">SK Pengangkatan</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Status</TableHead>
            <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                Tidak ada data aparat. Silakan tambah data baru.
              </TableCell>
            </TableRow>
          ) : (
            data.map((aparat, index) => (
              <TableRow key={aparat.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <TableCell className="text-gray-700 dark:text-gray-300">{aparat.nomorUrut || index + 1}</TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-gray-100">{aparat.nama}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{aparat.nip || '-'}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{aparat.jenisKelamin}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">
                  {aparat.tempatLahir}, {formatDate(aparat.tanggalLahir)}
                </TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{aparat.agama || '-'}</TableCell>
                <TableCell className="text-gray-700 dark:text-gray-300">{aparat.jabatan}</TableCell>
                
                {/* Render SK aman: bisa string atau object */}
                <TableCell className="text-gray-700 dark:text-gray-300">
                  {typeof aparat.skPengangkatan === 'object' ? aparat.skPengangkatan?.nomor : (aparat.skPengangkatan || '-')}
                </TableCell>

                <TableCell>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    aparat.status === "AKTIF" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                  }`}>
                    {aparat.status}
                  </span>
                </TableCell>
                
                <TableCell className="text-right space-x-2 whitespace-nowrap">
                  {/* TOMBOL LIHAT DETAIL */}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onView(aparat)}
                    title="Lihat Detail"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </Button>

                  {/* TOMBOL EDIT */}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onEdit(aparat)}
                    title="Edit"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Edit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </Button>

                  {/* TOMBOL HAPUS */}
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onDelete(aparat)}
                    title="Hapus"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AparatTable;