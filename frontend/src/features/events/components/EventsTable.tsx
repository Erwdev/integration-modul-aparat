import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { EventLog } from "../types";
import { useState } from "react";

interface EventsTableProps {
  data: EventLog[];
}

const EventsTable = ({ data }: EventsTableProps) => {
  const [expandedPayload, setExpandedPayload] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-900/50">
            <TableHead>Waktu</TableHead>
            <TableHead>Topik</TableHead>
            <TableHead>Sumber</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payload (Preview)</TableHead>
            <TableHead>Retry</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">Belum ada event log.</TableCell>
            </TableRow>
          ) : (
            data.map((event) => (
              <>
                <TableRow key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <TableCell className="text-sm whitespace-nowrap">
                    {format(new Date(event.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: id })}
                  </TableCell>
                  <TableCell className="font-medium">{event.topic}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {event.source_module}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      event.status === 'PROCESSED' ? 'bg-green-100 text-green-800' :
                      event.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs text-gray-500 text-xs font-mono">
                    <button
                      onClick={() => setExpandedPayload(expandedPayload === event.id ? null : event.id)}
                      className="text-blue-600 hover:text-blue-800 underline break-all text-left"
                    >
                      {JSON.stringify(event.payload).substring(0, 50)}...
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    {event.retry_count} / {event.max_retries}
                  </TableCell>
                </TableRow>
                {expandedPayload === event.id && (
                  <TableRow className="bg-gray-100 dark:bg-gray-700">
                    <TableCell colSpan={6} className="py-4">
                      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-96">
                        <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EventsTable;