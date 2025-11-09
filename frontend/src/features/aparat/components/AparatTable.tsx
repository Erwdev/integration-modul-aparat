import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Eye } from "lucide-react";

interface Aparat {
  nama: string;
  jabatan: string;
  nip: string;
  status: string;
}

interface AparatTableProps {
  data: Aparat[];
}

const AparatTable = ({ data }: AparatTableProps) => {
  return (
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
          {data.map((aparat, i) => (
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
  );
};

export default AparatTable;