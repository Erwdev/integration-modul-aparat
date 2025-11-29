// Re-export dari global types untuk menghindari duplikasi
import { Aparat } from '@/types/aparat'; 
export type { Aparat }; // Re-export

export interface AparatResponse {
  data: Aparat[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AparatFormData {
  nama: string;
  nik: string; // ✅ PASTIKAN INI ADA
  jabatan: string;
  nip: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  pangkatGolongan: string;
  pendidikanTerakhir: string;
  skPengangkatanNomor: string;
  skPengangkatanTanggal: string;
  skPemberhentianNomor?: string;
  skPemberhentianTanggal?: string;
  status?: 'Aktif' | 'Nonaktif';
}