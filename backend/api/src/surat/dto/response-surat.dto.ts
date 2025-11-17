// Impor enum dari lokasi barunya
import { JenisSurat } from '../enums/jenis-surat.enum';
import { StatusSurat } from '../enums/status-surat.enum';

export class SuratResponseDto {
  id: string;
  nomor_surat: string;
  jenis: JenisSurat;
  perihal: string;
  tanggal_surat: Date;
  pengirim?: string;
  penerima?: string;
  id_aparat_penandatangan?: string;
  status: StatusSurat;
  isi_ringkas?: string;
  lampiran_url?: string;
  version: number;
  etag?: string;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  updated_by?: string;
}

export class PaginatedSuratResponseDto {
  data: SuratResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}