import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import type { AparatFormData } from "../types";

interface AddAparatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AparatFormData) => void;
}

const AddAparatModal = ({ isOpen, onClose, onSubmit }: AddAparatModalProps) => {
  const [formData, setFormData] = useState<AparatFormData>({
    nama: "",
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
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({
      nama: "",
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
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Aparat Baru</DialogTitle>
          <DialogDescription>
            Masukkan data aparat baru di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="grid gap-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Masukkan nama lengkap"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="nip">NIP/NIAPD</Label>
            <Input
              id="nip"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              placeholder="Masukkan NIP atau NIAPD"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
              <Select
                value={formData.jenisKelamin}
                onValueChange={(value) => setFormData({ ...formData, jenisKelamin: value as 'L' | 'P' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis kelamin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="agama">Agama</Label>
              <Input
                id="agama"
                value={formData.agama}
                onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                placeholder="Masukkan agama"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tempatLahir">Tempat Lahir</Label>
              <Input
                id="tempatLahir"
                value={formData.tempatLahir}
                onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                placeholder="Masukkan tempat lahir"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
              <Input
                id="tanggalLahir"
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jabatan">Jabatan</Label>
            <Input
              id="jabatan"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              placeholder="Masukkan jabatan"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pangkatGolongan">Pangkat/Golongan (opsional)</Label>
            <Input
              id="pangkatGolongan"
              value={formData.pangkatGolongan}
              onChange={(e) => setFormData({ ...formData, pangkatGolongan: e.target.value })}
              placeholder="Masukkan pangkat/golongan"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pendidikanTerakhir">Pendidikan Terakhir</Label>
            <Input
              id="pendidikanTerakhir"
              value={formData.pendidikanTerakhir}
              onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value })}
              placeholder="Masukkan pendidikan terakhir"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="skPengangkatanNomor">Nomor SK Pengangkatan</Label>
              <Input
                id="skPengangkatanNomor"
                value={formData.skPengangkatanNomor}
                onChange={(e) => setFormData({ ...formData, skPengangkatanNomor: e.target.value })}
                placeholder="Masukkan nomor SK"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skPengangkatanTanggal">Tanggal SK Pengangkatan</Label>
              <Input
                id="skPengangkatanTanggal"
                type="date"
                value={formData.skPengangkatanTanggal}
                onChange={(e) => setFormData({ ...formData, skPengangkatanTanggal: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="skPemberhentianNomor">Nomor SK Pemberhentian (opsional)</Label>
              <Input
                id="skPemberhentianNomor"
                value={formData.skPemberhentianNomor || ""}
                onChange={(e) => setFormData({ ...formData, skPemberhentianNomor: e.target.value })}
                placeholder="Masukkan nomor SK"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="skPemberhentianTanggal">Tanggal SK Pemberhentian (opsional)</Label>
              <Input
                id="skPemberhentianTanggal"
                type="date"
                value={formData.skPemberhentianTanggal || ""}
                onChange={(e) => setFormData({ ...formData, skPemberhentianTanggal: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAparatModal;