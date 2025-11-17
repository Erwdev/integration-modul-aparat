import type { ReportData } from '@/types/reports';

export interface GenerateReportParams {
  type: 'daily' | 'weekly' | 'monthly';
  month: string;
  year: string;
  format: 'pdf' | 'excel';
}

class ReportService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  async generateReport(params: GenerateReportParams): Promise<ReportData> {
    try {
      const response = await fetch(`${this.apiUrl}/api/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      return response.json();
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async exportReport(params: GenerateReportParams): Promise<Blob> {
    try {
      const response = await fetch(`${this.apiUrl}/api/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      return response.blob();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();