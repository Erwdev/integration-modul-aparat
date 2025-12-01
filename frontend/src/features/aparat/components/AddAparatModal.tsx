import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { AparatFormData } from "../types";
import { uploadSignature } from "../api/aparatApi"; // Import fungsi upload

interface AddAparatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AparatFormData) => void;
}

const AddAparatModal = ({ isOpen, onClose, onSubmit }: AddAparatModalProps) => {
  const initialData: AparatFormData = {
    nama: "",
    nik: "",
    jabatan: "",
    nip: "",
    jenisKelamin: "L",
    tempatLahir: "",
    tanggalLahir: "",
    agama: "",
    pangkatGolongan: "",
    pendidikanTerakhir: "",
    skPengangkatanNomor: "",
    skPengangkatanTanggal: "",
    skPemberhentianNomor: "",
    skPemberhentianTanggal: "",
    tandaTanganUrl: "", // Field untuk URL
    status: "AKTIF" as any,
  };

  const [formData, setFormData] = useState<AparatFormData>(initialData);
  const [file, setFile] = useState<File | null>(null); // State untuk file
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.nama || !formData.nik || !formData.jabatan || !formData.agama || !formData.tempatLahir || !formData.tanggalLahir || !formData.nip) {
      alert("Mohon lengkapi field bertanda bintang (*)!");
      return;
    }
    if (formData.nik.length !== 16) {
      alert("NIK harus 16 digit angka.");
      return;
    }

    let finalData = { ...formData };

    // 1. Cek apakah ada file yang dipilih
    if (file) {
      try {
        setIsUploading(true);
        // 2. Upload file ke backend
        const url = await uploadSignature(file);
        // 3. Masukkan URL hasil upload ke data yang akan disimpan
        finalData.tandaTanganUrl = url;
      } catch (error) {
        console.error("Gagal upload tanda tangan:", error);
        alert("Gagal mengupload tanda tangan. Data tidak tersimpan.");
        setIsUploading(false);
        return; // Batalkan simpan jika upload gagal
      } finally {
        setIsUploading(false);
      }
    }

    // 4. Kirim data lengkap (termasuk URL tanda tangan jika ada)
    onSubmit(finalData);
    
    // Reset
    setFormData(initialData);
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Aparat Baru</DialogTitle>
          <DialogDescription>
            Lengkapi data di bawah ini.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Nama & NIK */}
          <div className="grid gap-2">
            <Label>Nama Lengkap <span className="text-red-500">*</span></Label>
            <Input value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>NIK (16 Digit) <span className="text-red-500">*</span></Label>
              <Input value={formData.nik} maxLength={16} onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="grid gap-2">
              <Label>NIP/NIAPD <span className="text-red-500">*</span></Label>
              <Input value={formData.nip} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} />
            </div>
          </div>

          {/* Kelamin & Agama */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Jenis Kelamin <span className="text-red-500">*</span></Label>
              <Select value={formData.jenisKelamin} onValueChange={(val: 'L'|'P') => setFormData({ ...formData, jenisKelamin: val })}>
                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Agama <span className="text-red-500">*</span></Label>
              <Select value={formData.agama} onValueChange={(val) => setFormData({ ...formData, agama: val })}>
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
              <Input value={formData.tempatLahir} onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Tanggal Lahir <span className="text-red-500">*</span></Label>
              <Input type="date" value={formData.tanggalLahir} onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })} />
            </div>
          </div>

          {/* Jabatan */}
          <div className="grid gap-2">
            <Label>Jabatan <span className="text-red-500">*</span></Label>
            <Select value={formData.jabatan} onValueChange={(val) => setFormData({ ...formData, jabatan: val })}>
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
                <SelectItem value="Dukuh">Dukuh / Kepala Dusun</SelectItem>
                <SelectItem value="Staf">Staf</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Pangkat/Golongan</Label>
              <Input value={formData.pangkatGolongan} onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Pendidikan</Label>
              <Input value={formData.pendidikanTerakhir} onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })} />
            </div>
          </div>

          {/* SK */}
          <div className="border-t pt-4 mt-2">
            <Label className="mb-2 block font-semibold text-gray-700">SK Pengangkatan (Opsional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs">Nomor SK</Label>
                <Input value={formData.skPengangkatanNomor} onChange={(e) => setFormData({ ...formData, skPengangkatanNomor: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs">Tanggal SK</Label>
                <Input type="date" value={formData.skPengangkatanTanggal} onChange={(e) => setFormData({ ...formData, skPengangkatanTanggal: e.target.value })} />
              </div>
            </div>
          </div>

          {/* ✅ INPUT FILE TANDA TANGAN */}
          <div className="grid gap-2 mt-2 border-t pt-4">
            <Label>Scan Tanda Tangan (Opsional)</Label>
            <Input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-500">Format: JPG, PNG. Maks 2MB.</p>
          </div>

          <div className="grid gap-2 mt-2">
            <Label>Status <span className="text-red-500">*</span></Label>
            <Select value={formData.status} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
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
          <Button variant="outline" onClick={onClose} disabled={isUploading}>Batal</Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            className="bg-indigo-600 text-white"
            disabled={isUploading}
          >
            {isUploading ? "Mengupload..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAparatModal;