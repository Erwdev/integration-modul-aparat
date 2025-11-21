import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import EventsTable from "@/features/events/components/EventsTable";
import { getEventsList, getEventStats } from "@/features/events/api/eventsApi";
import type { EventLog, EventStats } from "@/features/events/types";
import { useTheme } from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle, XCircle, Clock } from "lucide-react";

const EventsPage = () => {
  const [events, setEvents] = useState<EventLog[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useTheme();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getEventsList(),
        getEventStats()
      ]);
      setEvents(listRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    document.body.className = isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  }, [isDarkMode]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar activeMenu="events" /> {/* Pastikan nanti update Sidebar prop */}

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <h2 className="text-2xl font-bold mb-6">Audit Logs (Event Bus)</h2>

        {/* Statistik Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Berhasil</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processed}</div>
                <p className="text-xs text-muted-foreground">{stats.success_rate} Success Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gagal</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.failed}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabel */}
        {isLoading ? (
          <div className="text-center py-10">Memuat data...</div>
        ) : (
          <EventsTable data={events} />
        )}
      </main>
      <Toaster />
    </div>
  );
};

export default EventsPage;