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
import { useState, useEffect } from "react";

interface Aparat {
  nama: string;
  jabatan: string;
  nip: string;
  status: string;
}

interface EditAparatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Aparat) => void;
  aparat: Aparat | null;
}

const EditAparatModal = ({ isOpen, onClose, onSubmit, aparat }: EditAparatModalProps) => {
  const [formData, setFormData] = useState<Aparat>({
    nama: "",
    jabatan: "",
    nip: "",
    status: "Aktif",
  });

  useEffect(() => {
    if (aparat) {
      setFormData(aparat);
    }
  }, [aparat]);

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ nama: "", jabatan: "", nip: "", status: "Aktif" });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Data Aparat</DialogTitle>
          <DialogDescription>
            Ubah data aparat di bawah ini.
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
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAparatModal;