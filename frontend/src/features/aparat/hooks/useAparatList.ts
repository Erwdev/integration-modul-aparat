import { useState, useEffect } from 'react';
import { Aparat } from '../types';
import { getAparatList } from '../api/aparatApi';

export const useAparatList = () => {
  const [aparatList, setAparatList] = useState<Aparat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAparatList = async () => {
    try {
      setIsLoading(true);
      const response = await getAparatList();
      setAparatList(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAparatList();
  }, []);

  return {
    aparatList,
    isLoading,
    error,
    refetch: fetchAparatList,
  };
};