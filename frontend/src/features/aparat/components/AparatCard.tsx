import { FC } from 'react';
import { Aparat } from '../types';

interface AparatCardProps {
  aparat: Aparat;
}

export const AparatCard: FC<AparatCardProps> = ({ aparat }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* PERBAIKAN: Gunakan aparat.nama, bukan aparat.name */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
        {aparat.nama} 
      </h3>
      
      <div className="space-y-2">
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <span className="text-sm">NIP: {aparat.nip || '-'}</span>
        </div>
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <span className="text-sm">Jabatan: {aparat.jabatan}</span>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => alert('Edit ' + aparat.nama)}
        >
          Edit
        </button>
        <button 
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          onClick={() => alert('View details of ' + aparat.nama)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};