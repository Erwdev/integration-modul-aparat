import { FC } from 'react';
import { Aparat } from '../types';

interface AparatListProps {
  aparatList: Aparat[];
  isLoading: boolean;
  error: string | null;
}

export const AparatList: FC<AparatListProps> = ({ aparatList, isLoading, error }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {aparatList.map((aparat) => (
        <div key={aparat.id} className="p-4 border rounded-lg shadow">
          <h3 className="text-lg font-semibold">{aparat.name}</h3>
          {/* Add more aparat details here */}
        </div>
      ))}
    </div>
  );
};