'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

type ReportItem = {
  report: {
    id: string;
    targetType: string;
    targetId: string;
    reportReason: string;
    reportDetails?: string | null;
    status: ReportStatus;
    createdAt: string;
  };
  reporter?: {
    displayName?: string | null;
  } | null;
};

type ModerationAction = {
  id: string;
  targetType: string;
  targetId: string;
  actionType: string;
  reason?: string | null;
  createdAt: string;
};

const emptyStats: Record<string, number> = {
  pending: 0,
  under_review: 0,
  resolved: 0,
  dismissed: 0,
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export default function AdminCommunityPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportStats, setReportStats] = useState<Record<string, number>>(emptyStats);
  const [moderationActions, setModerationActions] = useState<ModerationAction[]>([]);
  const [moderationStats, setModerationStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const totalActions = useMemo(
    () => Object.values(moderationStats).reduce((total, value) => total + value, 0),
    [moderationStats]
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [reportsPayload, reportStatsPayload, actionsPayload, moderationStatsPayload] = await Promise.all([
        fetchJson<{ reports: ReportItem[] }>('/api/community/reports?page=1&limit=10&status=pending'),
        fetchJson<{ stats: Record<string, number> }>('/api/community/reports?stats=true'),
        fetchJson<{ actions: ModerationAction[] }>('/api/community/moderation?page=1&limit=10'),
        fetchJson<{ stats: Record<string, number> }>('/api/community/moderation?stats=true'),
      ]);

      setReports(reportsPayload.reports || []);
      setReportStats({ ...emptyStats, ...(reportStatsPayload.stats || {}) });
      setModerationActions(actionsPayload.actions || []);
      setModerationStats(moderationStatsPayload.stats || {});
    } catch (loadError: any) {
      setError(loadError.message || 'Unable to load community administration data.');
      setReports([]);
      setReportStats(emptyStats);
      setModerationActions([]);
      setModerationStats({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const updateReportStatus = async (report: ReportItem['report'], status: ReportStatus) => {
    setActionId(`${report.id}:${status}`);
    setError('');

    try {
      await fetchJson(`/api/community/reports?reportId=${report.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      if (status === 'dismissed' || status === 'resolved') {
        await fetchJson('/api/community/moderation', {
          method: 'POST',
          body: JSON.stringify({
            targetType: report.targetType,
            targetId: report.targetId,
            actionType: status === 'dismissed' ? 'approve' : 'escalate',
            reason: status === 'dismissed' ? 'Report dismissed from admin queue.' : 'Report resolved from admin queue.',
          }),
        });
      }

      await loadDashboard();
    } catch (updateError: any) {
      setError(updateError.message || 'Unable to update report.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Administration</h1>
          <p className="text-muted-foreground">Manage community content and moderation</p>
        </div>
        <Button type="button" variant="outline" onClick={loadDashboard} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        <StatCard title="Pending Reports" value={reportStats.pending || 0} icon={<AlertTriangle className="h-4 w-4 text-orange-500" />} />
        <StatCard title="Under Review" value={reportStats.under_review || 0} icon={<Clock className="h-4 w-4 text-blue-500" />} />
        <StatCard title="Resolved" value={reportStats.resolved || 0} icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
        <StatCard title="Total Actions" value={totalActions} icon={<Shield className="h-4 w-4 text-purple-500" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState label="Loading reports..." />
            ) : reports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending reports</p>
            ) : (
              <div className="space-y-3">
                {reports.map(({ report, reporter }) => (
                  <div key={report.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <Badge variant="secondary">{report.reportReason}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium">{report.targetType}: {report.targetId}</p>
                    <p className="text-xs text-muted-foreground">Reporter: {reporter?.displayName || 'Unknown user'}</p>
                    {report.reportDetails && <p className="text-sm text-muted-foreground mt-1">{report.reportDetails}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={actionId === `${report.id}:under_review`}
                        onClick={() => updateReportStatus(report, 'under_review')}
                      >
                        {actionId === `${report.id}:under_review` ? 'Reviewing...' : 'Review'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={actionId === `${report.id}:dismissed`}
                        onClick={() => updateReportStatus(report, 'dismissed')}
                      >
                        {actionId === `${report.id}:dismissed` ? 'Dismissing...' : 'Dismiss'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={actionId === `${report.id}:resolved`}
                        onClick={() => updateReportStatus(report, 'resolved')}
                      >
                        {actionId === `${report.id}:resolved` ? 'Resolving...' : 'Resolve'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Moderation Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState label="Loading actions..." />
            ) : moderationActions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent actions</p>
            ) : (
              <div className="space-y-3">
                {moderationActions.map((action) => (
                  <div key={action.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2 gap-3">
                      <Badge variant="secondary">{action.actionType}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(action.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium">{action.targetType}: {action.targetId}</p>
                    <p className="text-sm text-muted-foreground mt-1">{action.reason || 'No reason provided.'}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
