export interface Aparat {
  id: string;
  name: string;
  // Tambahkan field lain sesuai kebutuhan
}

export interface AparatResponse {
  data: Aparat[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}