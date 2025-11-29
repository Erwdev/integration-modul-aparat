import type { Aparat } from '@/types/aparat';

export interface AparatFormData extends Omit<Aparat, 'id' | 'nomorUrut' | 'status' | 'skPengangkatan' | 'skPemberhentian'> {
  skPengangkatanNomor: string;
  skPengangkatanTanggal: string;
  skPemberhentianNomor?: string;
  skPemberhentianTanggal?: string;
}