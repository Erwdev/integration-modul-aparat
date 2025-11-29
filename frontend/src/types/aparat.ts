export interface Aparat {
  id: string;
  nomorUrut?: number; // Ubah jadi optional (?) agar cocok dengan tipe lain
  nama: string;
  nip: string;
  nik?: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  pangkatGolongan?: string;
  jabatan: string;
  pendidikanTerakhir: string;
  skPengangkatan?: string | { nomor: string; tanggal: string };
  skPemberhentian?: string | { nomor: string; tanggal: string };
  status?: string;
  keterangan?: string;
  tandaTanganUrl?: string;
}