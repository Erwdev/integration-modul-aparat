import { FC } from 'react';
import { Aparat } from '../types';

interface AparatCardProps {
  aparat: Aparat;
}

export const AparatCard: FC<AparatCardProps> = ({ aparat }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{aparat.name}</h3>
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <span className="text-sm">ID: {aparat.id}</span>
        </div>
        {/* Add more details as needed */}
      </div>
      <div className="mt-4 flex space-x-2">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => alert('Edit ' + aparat.name)}
        >
          Edit
        </button>
        <button 
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          onClick={() => alert('View details of ' + aparat.name)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};