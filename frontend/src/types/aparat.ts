export interface Aparat {
  id: string;
  nomorUrut: number;
  nama: string;
  nip: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  pangkatGolongan?: string;
  jabatan: string;
  pendidikanTerakhir: string;
  skPengangkatan: {
    nomor: string;
    tanggal: string;
  };
  skPemberhentian?: {
    nomor: string;
    tanggal: string;
  };
  status: 'Aktif' | 'Nonaktif';
  keterangan?: string;
}