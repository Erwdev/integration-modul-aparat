export interface EventLog {
  id: string;
  topic: string;
  payload: any;
  source_module: string; // snake_case dari backend
  idempotency_key: string;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  timestamp: string;
  created_at: string;
  retry_count: number;
  max_retries: number;
  last_error?: string;
}

export interface EventsResponse {
  data: EventLog[];
  total: number;
  meta: {
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface EventStats {
  total: number;
  pending: number;
  processed: number;
  failed: number;
  success_rate: string;
}