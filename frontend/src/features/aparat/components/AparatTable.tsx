import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Eye } from "lucide-react";
import type { Aparat } from "@/types/aparat";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AparatTableProps {
  data: Aparat[];
  onEdit: (aparat: Aparat) => void;
  onDelete: (aparat: Aparat) => void;
}

const AparatTable = ({ data, onEdit, onDelete }: AparatTableProps) => {
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
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Pangkat/Gol.</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Jabatan</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Pendidikan</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">SK Pengangkatan</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">SK Pemberhentian</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Status</TableHead>
            <TableHead className="text-gray-700 dark:text-gray-300 font-semibold">Keterangan</TableHead>
            <TableHead className="text-right text-gray-700 dark:text-gray-300 font-semibold">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((aparat) => (
            <TableRow key={aparat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:border-gray-700 transition-colors">
              <TableCell className="text-gray-700 dark:text-gray-300">{aparat.nomorUrut}</TableCell>
              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{aparat.nama}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{aparat.nip}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{aparat.jenisKelamin}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">
                {aparat.tempatLahir}, {format(new Date(aparat.tanggalLahir), 'dd MMMM yyyy', { locale: id })}
              </TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{aparat.agama}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{aparat.pangkatGolongan || '-'}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{aparat.jabatan}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{aparat.pendidikanTerakhir}</TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">
                {aparat.skPengangkatan.nomor}<br />
                <span className="text-xs">
                  {format(new Date(aparat.skPengangkatan.tanggal), 'dd/MM/yyyy')}
                </span>
              </TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">
                {aparat.skPemberhentian ? (
                  <>
                    {aparat.skPemberhentian.nomor}<br />
                    <span className="text-xs">
                      {format(new Date(aparat.skPemberhentian.tanggal), 'dd/MM/yyyy')}
                    </span>
                  </>
                ) : '-'}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                    aparat.status === "Aktif"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {aparat.status}
                </span>
              </TableCell>
              <TableCell className="text-gray-700 dark:text-gray-300">{aparat.keterangan || '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => onEdit(aparat)}
                  title="Edit Aparat"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost"
                  onClick={() => onDelete(aparat)}
                  title="Hapus Aparat"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost"
                  title="Lihat Detail"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AparatTable;