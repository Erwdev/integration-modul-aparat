import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import type { Aparat } from '@/features/aparat/types';

interface EditAparatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Aparat) => void;
  aparat: Aparat | null;
}

const EditAparatModal = ({ isOpen, onClose, onSubmit, aparat }: EditAparatModalProps) => {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (aparat) {
      const normalizeSK = (data: any) => {
        if (!data) return { nomor: '', tanggal: '' };
        if (typeof data === 'string') return { nomor: data, tanggal: '' };
        return data;
      };

      setFormData({
        ...aparat,
        tanggalLahir: aparat.tanggalLahir ? new Date(aparat.tanggalLahir).toISOString().split('T')[0] : '',
        skPengangkatan: normalizeSK(aparat.skPengangkatan),
        skPemberhentian: normalizeSK(aparat.skPemberhentian),
        status: aparat.status ? aparat.status.toUpperCase() : 'AKTIF',
      });
    }
  }, [aparat]);

  const handleSubmit = () => {
    if (!formData) return;

    if (!formData.nama || !formData.jabatan || !formData.agama || !formData.tempatLahir || !formData.tanggalLahir || !formData.nip) {
      alert("Mohon lengkapi field bertanda bintang (*)!");
      return;
    }

    const cleanPayload: any = {
      id: aparat?.id,
      nama: formData.nama,
      nik: formData.nik,
      jenisKelamin: formData.jenisKelamin,
      tempatLahir: formData.tempatLahir,
      tanggalLahir: formData.tanggalLahir,
      jabatan: formData.jabatan,
      agama: formData.agama,

      nip: formData.nip || '',
      pangkatGolongan: formData.pangkatGolongan || '',
      pendidikanTerakhir: formData.pendidikanTerakhir || '',
      status: formData.status,
      keterangan: formData.keterangan || '',

      skPengangkatanNomor: formData.skPengangkatan?.nomor || '',
      skPengangkatanTanggal: formData.skPengangkatan?.tanggal || '',
      skPemberhentianNomor: formData.skPemberhentian?.nomor || '',
      skPemberhentianTanggal: formData.skPemberhentian?.tanggal || '',
    };

    onSubmit(cleanPayload);
    onClose();
  };

  if (!formData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Data Aparat</DialogTitle>
          <DialogDescription>Ubah data aparat di bawah ini.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Nama & NIK */}
          <div className="grid gap-2">
            <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input
              value={formData.nama || ''}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>NIK <span className="text-gray-400 text-xs">(Tidak dapat diubah)</span></Label>
            <Input
              value={formData.nik || ''}
              readOnly
              className="bg-gray-100 cursor-not-allowed text-gray-500"
            />
          </div>

          <div className="grid gap-2">
            <Label>NIP/NIAPD <span className="text-red-500">*</span></Label>
            <Input
              value={formData.nip || ''}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
            />
          </div>

          {/* Kelamin & Agama */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
              <Select
                value={formData.jenisKelamin}
                onValueChange={(val) => setFormData({ ...formData, jenisKelamin: val })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Agama <span className="text-red-500">*</span></Label>
              <Select
                value={formData.agama}
                onValueChange={(val) => setFormData({ ...formData, agama: val })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Islam">Islam</SelectItem>
                  <SelectItem value="Kristen">Kristen</SelectItem>
                  <SelectItem value="Katolik">Katolik</SelectItem>
                  <SelectItem value="Hindu">Hindu</SelectItem>
                  <SelectItem value="Buddha">Buddha</SelectItem>
                  <SelectItem value="Khonghucu">Khonghucu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TTL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tempat Lahir <span className="text-red-500">*</span></Label>
              <Input
                value={formData.tempatLahir || ''}
                onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tanggal Lahir <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.tanggalLahir || ''}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
              />
            </div>
          </div>

          {/* Jabatan */}
          <div className="grid gap-2">
            <Label>Jabatan <span className="text-red-500">*</span></Label>
            <Select
              value={formData.jabatan}
              onValueChange={(val) => setFormData({ ...formData, jabatan: val })}
            >
              <SelectTrigger><SelectValue placeholder="Pilih Jabatan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Lurah">Lurah / Kepala Desa</SelectItem>
                <SelectItem value="Sekretaris Desa">Sekretaris Desa</SelectItem>
                <SelectItem value="Kepala Urusan Tata Usaha dan Umum">Kaur TU & Umum</SelectItem>
                <SelectItem value="Kepala Urusan Keuangan">Kaur Keuangan</SelectItem>
                <SelectItem value="Kepala Urusan Perencanaan">Kaur Perencanaan</SelectItem>
                <SelectItem value="Kepala Seksi Pemerintahan">Kasi Pemerintahan</SelectItem>
                <SelectItem value="Kepala Seksi Kesejahteraan">Kasi Kesejahteraan</SelectItem>
                <SelectItem value="Kepala Seksi Pelayanan">Kasi Pelayanan</SelectItem>
                <SelectItem value="Kepala Dusun">Dukuh / Kepala Dusun</SelectItem>
                <SelectItem value="Staf">Staf</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opsional */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Pangkat/Golongan <span className="text-gray-400 text-xs">(Opsional)</span></Label>
              <Input
                value={formData.pangkatGolongan || ''}
                onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Pendidikan Terakhir <span className="text-gray-400 text-xs">(Opsional)</span></Label>
              <Input
                value={formData.pendidikanTerakhir || ''}
                onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
              />
            </div>
          </div>

          {/* SK */}
          <div className="border-t pt-4 mt-2">
            <Label className="mb-2 block font-semibold text-gray-700">SK Pengangkatan (Opsional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs">Nomor SK</Label>
                <Input
                  value={formData.skPengangkatan?.nomor || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    skPengangkatan: { ...formData.skPengangkatan, nomor: e.target.value }
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Tanggal SK</Label>
                <Input
                  type="date"
                  value={formData.skPengangkatan?.tanggal || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    skPengangkatan: { ...formData.skPengangkatan, tanggal: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2 mt-2">
            <Label>Status <span className="text-red-500">*</span></Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AKTIF">Aktif</SelectItem>
                <SelectItem value="NONAKTIF">Nonaktif</SelectItem>
                <SelectItem value="CUTI">Cuti</SelectItem>
                <SelectItem value="PENSIUN">Pensiun</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button type="submit" onClick={handleSubmit} className="bg-indigo-600 text-white">Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAparatModal;