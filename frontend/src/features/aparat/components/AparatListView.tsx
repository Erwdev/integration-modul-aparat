import { useAparatList } from '../hooks/useAparatList';
import { AparatCard } from './AparatCard';

export const AparatListView = () => {
  const { aparatList, isLoading, error } = useAparatList();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Aparat</h1>
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          onClick={() => alert('Add new aparat')}
        >
          Tambah Aparat
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {aparatList.map((aparat) => (
          <AparatCard key={aparat.id} aparat={aparat} />
        ))}
      </div>
    </div>
  );
};