import { Aparat, AparatResponse } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const getAparatList = async (): Promise<AparatResponse> => {
  const response = await fetch(`${BASE_URL}/api/aparat`);
  if (!response.ok) {
    throw new Error('Failed to fetch aparat list');
  }
  return response.json();
};

export const getAparatById = async (id: string): Promise<Aparat> => {
  const response = await fetch(`${BASE_URL}/api/aparat/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch aparat');
  }
  return response.json();
};