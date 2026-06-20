'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users } from 'lucide-react';

export default function AdminAchievementsManagementPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('/admin/achievements/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold mb-2">Achievements Management</h1>
        <p className="text-gray-600">Monitor achievement progress and reward distribution</p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-600">Total Rewards Claimed</h3>
            </div>
            <p className="text-3xl font-bold">{analytics.totalRewardsClaimed || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">Unique Users</h3>
            </div>
            <p className="text-3xl font-bold">{analytics.uniqueUsers || 0}</p>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-medium text-gray-600">Avg Rewards/User</h3>
            </div>
            <p className="text-3xl font-bold">
              {analytics.averageRewardsPerUser?.toFixed(1) || '0.0'}
            </p>
          </div>
        </div>
      )}

      {/* Achievement Management Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h3 className="font-medium mb-1">Create New Achievement</h3>
            <p className="text-sm text-gray-600">Define a new achievement with criteria and rewards</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h3 className="font-medium mb-1">View All Achievements</h3>
            <p className="text-sm text-gray-600">Browse and manage existing achievement definitions</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h3 className="font-medium mb-1">Manually Award Achievement</h3>
            <p className="text-sm text-gray-600">Grant an achievement to a specific user</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
            <h3 className="font-medium mb-1">Generate Report</h3>
            <p className="text-sm text-gray-600">Export achievement analytics and statistics</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-lg border">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold">Recent Achievement Activity</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          Recent activity will be displayed here
        </div>
      </div>
    </div>
  );
}
