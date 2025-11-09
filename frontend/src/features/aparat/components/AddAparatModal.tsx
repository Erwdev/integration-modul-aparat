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

interface AddAparatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AparatFormData) => void;
}

export interface AparatFormData {
  nama: string;
  jabatan: string;
  nip: string;
  status: string;
}

const AddAparatModal = ({ isOpen, onClose, onSubmit }: AddAparatModalProps) => {
  const [formData, setFormData] = useState<AparatFormData>({
    nama: "",
    jabatan: "",
    nip: "",
    status: "Aktif",
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ nama: "", jabatan: "", nip: "", status: "Aktif" });
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
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nama">Nama Aparat</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Masukkan nama aparat"
            />
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
            <Label htmlFor="nip">NIP</Label>
            <Input
              id="nip"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              placeholder="Masukkan NIP"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Nonaktif">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
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