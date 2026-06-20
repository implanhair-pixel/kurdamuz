'use client';

import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';
import { useEffect } from 'react';

export function useUserData() {
  const setStats = useUserStore((state) => state.setStats);
  const setLoading = useUserStore((state) => state.setLoading);
  const setError = useUserStore((state) => state.setError);

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
    retry: 2,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [error, setError]);

  useEffect(() => {
    if (data?.user) {
      setStats({
        level: data.user.currentLevel || 1,
        currentXP: data.user.currentXP || 0,
        nextLevelXP: data.user.nextLevelXP || 100,
        totalXP: data.user.totalXP || 0,
        coinBalance: data.user.coinBalance || 0,
        currentStreak: data.user.currentStreak || 0,
        completedLessons: data.user.completedLessons || 0,
      });
    }
  }, [data, setStats]);

  return {
    data,
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to fetch dashboard');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useLeaderboardData(timeframe: 'weekly' | 'monthly' | 'all_time' = 'weekly') {
  return useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,
  });
}

export function useCoursesData() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch('/api/public/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60,
  });
}

export function useAchievementsData() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await fetch('/api/achievements');
      if (!response.ok) throw new Error('Failed to fetch achievements');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useStreaksData() {
  return useQuery({
    queryKey: ['streaks'],
    queryFn: async () => {
      const response = await fetch('/api/streaks');
      if (!response.ok) throw new Error('Failed to fetch streaks');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useWalletData() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await fetch('/api/wallet/balance');
      if (!response.ok) throw new Error('Failed to fetch wallet');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

export function useXPData() {
  return useQuery({
    queryKey: ['xp'],
    queryFn: async () => {
      const response = await fetch('/api/xp/balance');
      if (!response.ok) throw new Error('Failed to fetch XP data');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
