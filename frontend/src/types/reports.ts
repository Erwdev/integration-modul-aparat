export interface ReportData {
  type: 'daily' | 'weekly' | 'monthly';
  date: string;
  totalActivities: number;
  details: {
    ekspedisi: number;
    surat: number;
    administrasi: number;
  };
  activities: {
    ekspedisi: Array<{
      id: string;
      tanggal: string;
      tipe: string;
      status: string;
      pelaksana: string;
    }>;
    surat: Array<{
      id: string;
      tanggal: string;
      jenis: string;
      nomor: string;
      pemohon: string;
      status: string;
    }>;
    administrasi: Array<{
      id: string;
      tanggal: string;
      kegiatan: string;
      pelaksana: string;
      status: string;
    }>;
  };
}