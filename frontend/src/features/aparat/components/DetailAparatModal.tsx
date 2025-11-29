import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Aparat } from '@/features/aparat/types';
import { format, isValid } from "date-fns";
import { id } from "date-fns/locale";
// Hapus import Image jika tidak pakai next/image, pakai img biasa lebih aman untuk URL eksternal/lokal
// import Image from "next/image"; 

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  aparat: Aparat | null;
}

const DetailAparatModal = ({ isOpen, onClose, aparat }: DetailModalProps) => {
  if (!aparat) return null;

  // Helper Format Tanggal Aman
  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'dd MMMM yyyy', { locale: id }) : '-';
  };

  // Helper Parsing SK (String JSON / Object / Null)
  const getSKValue = (skData: any) => {
    if (!skData) return '-';

    let data = skData;
    
    // Jika Backend kirim string JSON, coba parse
    if (typeof skData === 'string') {
      try {
        // Cek apakah ini JSON string (diawali kurung kurawal)
        if (skData.trim().startsWith('{')) {
            data = JSON.parse(skData);
        } else {
            return skData; // String biasa (nomor saja)
        }
      } catch (e) {
        return skData; // Gagal parse, tampilkan apa adanya
      }
    }

    // Jika sudah jadi object
    if (typeof data === 'object' && data !== null) {
      const nomor = data.nomor || '-';
      const tanggal = data.tanggal ? ` (${formatDate(data.tanggal)})` : '';
      // Jika nomor kosong dan tanggal kosong
      if (nomor === '-' && !tanggal) return '-';
      return `${nomor}${tanggal}`;
    }
    
    return '-';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Data Aparat</DialogTitle>
          <DialogDescription>Informasi lengkap aparat desa.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          
          {/* 1. Informasi Pribadi */}
          <div className="space-y-3">
            <h4 className="font-medium text-indigo-600 border-b pb-1">Informasi Pribadi</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-500 text-xs">Nama Lengkap</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{aparat.nama || '-'}</div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">NIK</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{aparat.nik || '-'}</div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">NIP/NIAPD</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{aparat.nip || '-'}</div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Jenis Kelamin</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {aparat.jenisKelamin === 'L' ? 'Laki-laki' : aparat.jenisKelamin === 'P' ? 'Perempuan' : '-'}
                </div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Agama</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{aparat.agama || '-'}</div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Tempat, Tgl Lahir</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {aparat.tempatLahir || '-'}, {formatDate(aparat.tanggalLahir)}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Jabatan & Pekerjaan */}
          <div className="space-y-3">
            <h4 className="font-medium text-indigo-600 border-b pb-1">Jabatan & Pendidikan</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-500 text-xs">Jabatan</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{aparat.jabatan || '-'}</div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Pangkat/Golongan</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{aparat.pangkatGolongan || '-'}</div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Pendidikan Terakhir</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{aparat.pendidikanTerakhir || '-'}</div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Status</Label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                  aparat.status === 'AKTIF' || aparat.status === 'Aktif' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {aparat.status || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Legalitas (SK) - Menggunakan Helper Parser */}
          <div className="space-y-3">
            <h4 className="font-medium text-indigo-600 border-b pb-1">Legalitas (SK)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-500 text-xs">SK Pengangkatan</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{getSKValue(aparat.skPengangkatan)}</div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">SK Pemberhentian</Label>
                <div className="font-medium text-gray-900 dark:text-gray-100">{getSKValue(aparat.skPemberhentian)}</div>
              </div>
            </div>
          </div>

          {/* 4. Tanda Tangan Digital */}
          <div className="space-y-3">
            <h4 className="font-medium text-indigo-600 border-b pb-1">Tanda Tangan Digital</h4>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex justify-center items-center border border-gray-200 dark:border-gray-700 min-h-[100px]">
              {aparat.tandaTanganUrl ? (
                <div className="relative w-full h-32 flex justify-center">
                  {/* Gunakan img tag biasa agar tidak rewel soal domain */}
                  <img 
                    src={aparat.tandaTanganUrl} 
                    alt={`Tanda Tangan ${aparat.nama}`} 
                    className="object-contain h-full w-auto max-w-full"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        // Tampilkan fallback text jika gambar gagal load
                        const span = document.createElement('span');
                        span.innerText = 'Gagal memuat gambar';
                        span.className = 'text-red-500 text-xs';
                        (e.target as HTMLElement).parentElement?.appendChild(span);
                    }}
                  />
                </div>
              ) : (
                <span className="text-gray-400 text-sm italic">Belum ada tanda tangan diupload</span>
              )}
            </div>
            {/* Debugging Info (Bisa dihapus nanti) */}
            {/* <div className="text-[10px] text-gray-300 overflow-hidden truncate">URL: {aparat.tandaTanganUrl}</div> */}
          </div>

        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white">Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DetailAparatModal;