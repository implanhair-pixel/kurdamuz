
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Award, Flame } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppSidebar } from '@/components/AppSidebar';
import { AppHeader } from '@/components/AppHeader';
import { StatCard } from '@/components/StatCard';
import { useDashboardData } from '@/hooks/useUserData';
import { useUserStore } from '@/store/userStore';

export default function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations('dashboard');
  const [locale, setLocale] = useState('');
  const { data: dashboardData, isLoading } = useDashboardData();
  const stats = useUserStore((state) => state.stats);
  const setStats = useUserStore((state) => state.setStats);

  useEffect(() => {
    const initPage = async () => {
      const p = await params;
      setLocale(p.locale);
    };
    initPage();
  }, [params]);

  useEffect(() => {
    if (dashboardData?.user) {
      setStats({
        level: dashboardData.user.currentLevel || 1,
        currentXP: dashboardData.user.currentXP || 0,
        nextLevelXP: dashboardData.user.xpToNextLevel || dashboardData.user.nextLevelXP || 100,
        totalXP: dashboardData.user.totalXP || 0,
        coinBalance: dashboardData.user.coinBalance || 0,
        currentStreak: dashboardData.user.currentStreak || 0,
      });
    }
  }, [dashboardData, setStats]);

  const progressPercentage = (stats.currentXP / stats.nextLevelXP) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      <AppSidebar locale={locale} activePage="dashboard" />

      <main className="flex-1 overflow-auto">
        <AppHeader
          title={t('title')}
          description={t('description')}
          icon={<TrendingUp className="w-6 h-6" />}
        />

        <div className="p-8">
          <motion.div
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-slate-400 text-sm mb-2">{t('currentLevel')}</p>
                <p className="text-5xl font-bold text-white">{stats.level}</p>
              </motion.div>
              <motion.div
                className="text-right"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-slate-400 text-sm mb-2">{t('totalXpEarned')}</p>
                <p className="text-4xl font-bold text-emerald-400">{stats.totalXP.toLocaleString()}</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">{t('progressToLevel', { level: stats.level + 1 })}</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {stats.currentXP.toLocaleString()} / {stats.nextLevelXP.toLocaleString()} XP
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{Math.round(progressPercentage)}% {t('complete')}</p>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <StatCard
              title={t('level')}
              value={stats.level}
              icon={<Award className="w-8 h-8" />}
              color="emerald"
              subtitle={t('currentLevel')}
              delay={0}
            />
            <StatCard
              title={t('xpThisWeek')}
              value={dashboardData?.weeklyXP || 0}
              icon={<Zap className="w-8 h-8" />}
              color="blue"
              subtitle={t('experiencePoints')}
              delay={0.1}
            />
            <StatCard
              title={t('coins')}
              value={stats.coinBalance}
              icon={<span className="text-2xl">₵</span>}
              color="amber"
              subtitle={t('availableCoins')}
              delay={0.2}
            />
            <StatCard
              title={t('streak')}
              value={stats.currentStreak}
              icon={<Flame className="w-8 h-8" />}
              color="orange"
              subtitle={t('daysInRow')}
              delay={0.3}
            />
          </motion.div>

          {dashboardData?.recentActivities && (
            <motion.div
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-bold text-white mb-6">{t('recentActivity')}</h2>
              <div className="space-y-3">
                {dashboardData.recentActivities.slice(0, 5).map((activity: any, index: number) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-lg">
                        {activity.icon}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{activity.title}</p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                    </div>
                    <p className="text-emerald-400 font-semibold">+{activity.xp} XP</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {dashboardData?.recentActivities?.length === 0 && !isLoading && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-300">
              {t('noRecentActivity')}
            </div>
          )}

          {isLoading && (
            <motion.div
              className="flex items-center justify-center py-12"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
