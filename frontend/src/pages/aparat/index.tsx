import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const AparatPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const data = [
    { nama: "Reyhan Alfarel Qadavi", jabatan: "Sekretaris Desa", nip: "19870123", status: "Aktif" },
    { nama: "Garrett Hill", jabatan: "Kaur Keuangan", nip: "19890112", status: "Nonaktif" },
    { nama: "Ilham Pratama", jabatan: "Kasi Pelayanan", nip: "19900315", status: "Aktif" },
    { nama: "Kevin Sitanggang", jabatan: "Kaur Umum", nip: "19850607", status: "Aktif" },
    { nama: "John Doe", jabatan: "Kepala Desa", nip: "19820405", status: "Aktif" },
    { nama: "Jane Smith", jabatan: "Kaur TU", nip: "19880909", status: "Nonaktif" },
    { nama: "Bob Johnson", jabatan: "Kasi Kesra", nip: "19910203", status: "Aktif" },
    { nama: "Alice Brown", jabatan: "Kasi Pemerintahan", nip: "19900708", status: "Aktif" },
  ]

  // Filtering
  const filteredData = data.filter(aparat => {
    const matchesSearch = aparat.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aparat.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aparat.nip.includes(searchTerm);
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && aparat.status === filterStatus;
  });

  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md px-4 py-6">
        <h1 className="text-2xl font-bold text-blue-600 mb-8">SIAP</h1>
        <nav className="space-y-2">
          <p className="text-gray-400 uppercase text-xs">Data Management</p>
          <ul className="space-y-2">
            <li className="text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded-md">Aparat</li>
            <li className="text-gray-600 hover:text-blue-500 cursor-pointer">Ekspedisi</li>
            <li className="text-gray-600 hover:text-blue-500 cursor-pointer">Surat</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Daftar Aparat</h2>
          <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Aparat</Button>
        </div>

        {/* Search and Filter */}
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex gap-4 flex-1">
            <Input 
              placeholder="Cari Aparat..." 
              className="w-1/3" 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <select
              className="px-3 py-2 border rounded-md"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="all">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Aparat */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead>Nama Aparat</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((aparat, i) => (
                <TableRow key={i} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{aparat.nama}</TableCell>
                  <TableCell>{aparat.jabatan}</TableCell>
                  <TableCell>{aparat.nip}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        aparat.status === "Aktif"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {aparat.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                    <Button size="icon" variant="ghost">
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} dari {filteredData.length} data
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AparatPage
