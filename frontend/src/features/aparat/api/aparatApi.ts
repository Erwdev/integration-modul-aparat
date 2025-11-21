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

// Helper Error Handler
const handleApiError = async (response: Response, defaultMsg: string) => {
  try {
    const errorData = await response.json();
    const msg = Array.isArray(errorData.message) 
      ? errorData.message.join(', ') 
      : errorData.message;
    throw new Error(msg || defaultMsg);
  } catch (e) {
    if (e instanceof Error) throw e;
    throw new Error(defaultMsg);
  }
};

export const getAparatList = async (): Promise<AparatResponse> => {
  const response = await fetch(API_URL, { method: 'GET', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal mengambil data');
  return response.json();
};

export const getAparatById = async (id: string): Promise<Aparat> => {
  const response = await fetch(`${API_URL}/${id}`, { method: 'GET', headers: getHeaders() });
  if (!response.ok) await handleApiError(response, 'Gagal mengambil detail');
  return response.json();
};

export const createAparat = async (data: AparatFormData): Promise<Aparat> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) await handleApiError(response, 'Gagal menambah data');
  return response.json();
};

export const updateAparat = async (id: string, data: Partial<Aparat>): Promise<Aparat> => {
  // ✅ Clean Data tanpa 'any'
  const { id: _id, ...cleanData } = data; // Destructure id untuk dibuang
  
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(cleanData),
  });
  if (!response.ok) await handleApiError(response, 'Gagal mengupdate data');
  return response.json();
};

export const deleteAparat = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) await handleApiError(response, 'Gagal menghapus data');
};