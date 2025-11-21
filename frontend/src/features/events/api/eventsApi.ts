import { EventsResponse, EventStats } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1/events`;

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const getEventsList = async (page = 1, limit = 10): Promise<EventsResponse> => {
  // Hapus filter status agar mengambil SEMUA data (History)
  const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error('Gagal mengambil data events');
  return response.json();
};

export const getEventStats = async (): Promise<{ data: EventStats }> => {
  const response = await fetch(`${API_URL}/stats`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) throw new Error('Gagal mengambil statistik');
  return response.json();
};