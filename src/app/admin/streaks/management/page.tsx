'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminStreaksManagementPage() {
  const [pendingRecoveries, setPendingRecoveries] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, recoveriesRes] = await Promise.all([
        fetch('/admin/streaks/analytics'),
        fetch('/api/streaks/recovery'),
      ]);

      const analyticsData = await analyticsRes.json();
      const recoveriesData = await recoveriesRes.json();

      setAnalytics(analyticsData);
      setPendingRecoveries(recoveriesData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRecovery = async (requestId: string, approved: boolean) => {
    try {
      const response = await fetch('/api/streaks/recovery/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          approved,
          reviewedBy: 'admin', // Would be actual admin user ID
        }),
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error processing recovery request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Streaks Management</h1>
        <p className="text-gray-600">Manage user streaks and recovery requests</p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Pending Recovery Requests</h3>
            <p className="text-3xl font-bold">{analytics.pendingRecoveryRequests || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Recoveries (Today)</h3>
            <p className="text-3xl font-bold text-green-600">{analytics.recoveryRequestsByType?.automatic || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Manual Requests</h3>
            <p className="text-3xl font-bold text-blue-600">{analytics.recoveryRequestsByType?.manual || 0}</p>
          </div>
        </div>
      )}

      {/* Pending Recovery Requests */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Pending Recovery Requests</h2>
        </div>

        {pendingRecoveries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending recovery requests
          </div>
        ) : (
          <div className="divide-y">
            {pendingRecoveries.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {request.recoveryType}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(request.missedDate).toLocaleDateString()}
                      </span>
                    </div>
                    {request.reason && (
                      <p className="text-sm text-gray-600 mt-1">{request.reason}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProcessRecovery(request.id, true)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleProcessRecovery(request.id, false)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deny"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
