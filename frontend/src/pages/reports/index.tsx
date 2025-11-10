import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/Sidebar";
import { useTheme } from "@/context/ThemeContext";
import { Calendar, Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReportData {
  type: string;
  date: string;
  totalActivities: number;
  details: {
    ekspedisi: number;
    surat: number;
    administrasi: number;
  };
}

const ReportsPage = () => {
  const { isDarkMode } = useTheme();
  const [reportType, setReportType] = useState('daily');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Sample data - replace with actual API calls
  const sampleData: ReportData[] = [
    {
      type: 'daily',
      date: '2025-11-10',
      totalActivities: 15,
      details: {
        ekspedisi: 5,
        surat: 8,
        administrasi: 2
      }
    },
    // Add more sample data as needed
  ];

  const handleGenerateReport = () => {
    // TODO: Implement report generation logic
    console.log('Generating report:', { reportType, reportFormat, selectedMonth, selectedYear });
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    // TODO: Implement export logic
    console.log('Exporting report as:', format);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar activeMenu="reports" />

      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Laporan Aktivitas Aparat
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Generate dan ekspor laporan aktivitas aparat berdasarkan periode
          </p>
        </div>

        {/* Report Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Konfigurasi Laporan</CardTitle>
            <CardDescription>Pilih periode dan format laporan yang diinginkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipe Laporan
                </label>
                <Select
                  value={reportType}
                  onValueChange={setReportType}>
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe laporan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Harian</SelectItem>
                    <SelectItem value="weekly">Mingguan</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bulan
                </label>
                <Select
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {new Date(2025, i).toLocaleString('id-ID', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tahun
                </label>
                <Select
                  value={selectedYear}
                  onValueChange={setSelectedYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Format Ekspor
                </label>
                <Select
                  value={reportFormat}
                  onValueChange={setReportFormat}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleGenerateReport}
              className="w-full md:w-auto mt-4"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Generate Laporan
            </Button>
          </CardContent>
        </Card>

        {/* Report Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview Laporan</CardTitle>
            <CardDescription>Ringkasan aktivitas aparat berdasarkan periode yang dipilih</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ekspedisi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {sampleData[0].details.ekspedisi}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">aktivitas</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pelayanan Surat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {sampleData[0].details.surat}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">layanan</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Administrasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {sampleData[0].details.administrasi}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">kegiatan</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => handleExportReport('pdf')}
                className="flex-1 text-sm md:text-base"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportReport('excel')}
                className="flex-1 text-sm md:text-base"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export as Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReportsPage;