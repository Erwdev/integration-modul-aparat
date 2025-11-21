import { Aparat, AparatResponse } from '../types';
import type { AparatFormData } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1/aparat`;

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Header khusus upload (Tanpa Content-Type agar browser set boundary otomatis)
const getUploadHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return {
    'Authorization': `Bearer ${token}`,
  };
};

export const getAparatList = async (): Promise<AparatResponse> => {
  const response = await fetch(API_URL, { method: 'GET', headers: getHeaders() });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal mengambil data');
  }
  return response.json();
};

export const getAparatById = async (id: string): Promise<Aparat> => {
  const response = await fetch(`${API_URL}/${id}`, { method: 'GET', headers: getHeaders() });
  if (!response.ok) throw new Error('Gagal mengambil detail');
  return response.json();
};

// ✅ FUNGSI BARU: Upload Signature
export const uploadSignature = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload-signature`, {
    method: 'POST',
    headers: getUploadHeaders(), // Pakai header khusus
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Gagal upload tanda tangan');
  }

  const data = await response.json();
  return data.tanda_tangan_url; // Kembalikan URL gambar
};

export const createAparat = async (data: AparatFormData): Promise<Aparat> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
    throw new Error(msg || 'Gagal menambah data');
  }
  return response.json();
};

export const updateAparat = async (id: string, data: Partial<Aparat>): Promise<Aparat> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _, ...cleanData } = data as any; 
  
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(cleanData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
    throw new Error(msg || 'Gagal mengupdate data');
  }
  return response.json();
};

export const deleteAparat = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Gagal menghapus data');
};