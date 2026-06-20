'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ReportListProps {
  reports: any[];
  onSelectReport: (report: any) => void;
  onUpdateStatus: (reportId: string, status: string) => void;
}

const STATUS_ICONS: Record<string, any> = {
  pending: AlertTriangle,
  under_review: Clock,
  resolved: CheckCircle,
  dismissed: XCircle,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-orange-500',
  under_review: 'text-blue-500',
  resolved: 'text-green-500',
  dismissed: 'text-gray-500',
};

export function ReportList({ reports, onSelectReport, onUpdateStatus }: ReportListProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No reports</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report: any) => {
              const Icon = STATUS_ICONS[report.status] || AlertTriangle;
              const color = STATUS_COLORS[report.status] || 'text-gray-500';

              return (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => onSelectReport(report)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <Badge variant="secondary">{report.reportReason}</Badge>
                      <Badge variant="secondary">{report.status}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1">
                    {report.targetType}: {report.targetId}
                  </p>
                  {report.reportDetails && (
                    <p className="text-sm text-muted-foreground">{report.reportDetails}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {report.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(report.id, 'under_review');
                          }}
                        >
                          Start Review
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(report.id, 'dismissed');
                          }}
                        >
                          Dismiss
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
