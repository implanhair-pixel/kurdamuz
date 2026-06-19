'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, MessageSquare, Heart, Shield } from 'lucide-react';

interface CommunityAnalyticsProps {
  stats: {
    totalPosts: number;
    totalComments: number;
    totalReactions: number;
    totalUsers: number;
    activeUsers: number;
    pendingReports: number;
    resolvedReports: number;
  };
  trends: {
    postsGrowth: number;
    commentsGrowth: number;
    usersGrowth: number;
  };
}

export function CommunityAnalytics({ stats, trends }: CommunityAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              <span className={trends.postsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {trends.postsGrowth >= 0 ? '+' : ''}{trends.postsGrowth}%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              <span className={trends.commentsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {trends.commentsGrowth >= 0 ? '+' : ''}{trends.commentsGrowth}%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reactions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReactions}</div>
            <p className="text-xs text-muted-foreground">Total engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className={trends.usersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}>
                {trends.usersGrowth >= 0 ? '+' : ''}{trends.usersGrowth}%
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Moderation Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Reports</span>
              <span className="font-semibold">{stats.pendingReports}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resolved Reports</span>
              <span className="font-semibold">{stats.resolvedReports}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resolution Rate</span>
              <span className="font-semibold">
                {stats.pendingReports + stats.resolvedReports > 0
                  ? Math.round((stats.resolvedReports / (stats.pendingReports + stats.resolvedReports)) * 100)
                  : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg. Comments per Post</span>
              <span className="font-semibold">
                {stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg. Reactions per Post</span>
              <span className="font-semibold">
                {stats.totalPosts > 0 ? (stats.totalReactions / stats.totalPosts).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">User Engagement Rate</span>
              <span className="font-semibold">
                {stats.totalUsers > 0 ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
