export interface Aparat {
  id: string;
  name: string;
  // Tambahkan fields lain sesuai dengan entity di backend
}

export interface AparatResponse {
  data: Aparat[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}