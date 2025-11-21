import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Aparat } from '@/features/aparat/types';
import { format, isValid } from "date-fns";
import { id } from "date-fns/locale";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  aparat: Aparat | null;
}

const DetailAparatModal = ({ isOpen, onClose, aparat }: DetailModalProps) => {
  if (!aparat) return null;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'dd MMMM yyyy', { locale: id }) : '-';
  };

  // Helper untuk menampilkan SK dengan aman
  const getSKValue = (skData: any) => {
    if (!skData) return '-';
    if (typeof skData === 'string') return skData;
    if (typeof skData === 'object') {
      const nomor = skData.nomor || '-';
      const tanggal = skData.tanggal ? ` (${formatDate(skData.tanggal)})` : '';
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
          <div className="space-y-3">
            <h4 className="font-medium text-indigo-600 border-b pb-1">Informasi Pribadi</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><Label className="text-gray-500">Nama Lengkap</Label><div className="font-medium">{aparat.nama}</div></div>
              <div><Label className="text-gray-500">NIP/NIAPD</Label><div className="font-medium">{aparat.nip || '-'}</div></div>
              <div><Label className="text-gray-500">Jenis Kelamin</Label><div className="font-medium">{aparat.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div></div>
              <div><Label className="text-gray-500">Agama</Label><div className="font-medium">{aparat.agama || '-'}</div></div>
              <div><Label className="text-gray-500">Tempat, Tgl Lahir</Label><div className="font-medium">{aparat.tempatLahir}, {formatDate(aparat.tanggalLahir)}</div></div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-indigo-600 border-b pb-1">Jabatan & Pekerjaan</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><Label className="text-gray-500">Jabatan</Label><div className="font-medium">{aparat.jabatan}</div></div>
              <div><Label className="text-gray-500">Pangkat/Golongan</Label><div className="font-medium">{aparat.pangkatGolongan || '-'}</div></div>
              <div><Label className="text-gray-500">Pendidikan</Label><div className="font-medium">{aparat.pendidikanTerakhir || '-'}</div></div>
              <div><Label className="text-gray-500">Status</Label>
                <span className={`px-2 py-0.5 text-xs rounded-full ${aparat.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {aparat.status}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-indigo-600 border-b pb-1">Legalitas (SK)</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><Label className="text-gray-500">SK Pengangkatan</Label><div className="font-medium">{getSKValue(aparat.skPengangkatan)}</div></div>
              <div><Label className="text-gray-500">SK Pemberhentian</Label><div className="font-medium">{getSKValue(aparat.skPemberhentian)}</div></div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="bg-indigo-600 text-white">Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DetailAparatModal;