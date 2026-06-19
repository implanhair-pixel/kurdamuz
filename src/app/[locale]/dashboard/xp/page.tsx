'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Zap, TrendingUp, Award, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

const mockXPData = {
  currentXP: 2450,
  nextLevelXP: 5000,
  totalXP: 12450,
  level: 7,
  thisWeek: 1240,
  thisMonth: 4560,
  activities: [
    { id: 1, title: 'Completed Lesson', xp: 120, date: '2026-06-17', icon: '📚', category: 'Learning' },
    { id: 2, title: 'Daily Challenge', xp: 150, date: '2026-06-17', icon: '🎯', category: 'Challenge' },
    { id: 3, title: 'Quiz Perfect Score', xp: 200, date: '2026-06-16', icon: '💯', category: 'Quiz' },
    { id: 4, title: 'Streak Bonus', xp: 100, date: '2026-06-16', icon: '🔥', category: 'Streak' },
    { id: 5, title: 'Completed Lesson', xp: 130, date: '2026-06-15', icon: '📚', category: 'Learning' },
    { id: 6, title: 'Achievement Unlocked', xp: 300, date: '2026-06-15', icon: '🏆', category: 'Achievement' },
    { id: 7, title: 'Completed Lesson', xp: 125, date: '2026-06-14', icon: '📚', category: 'Learning' },
    { id: 8, title: 'Weekly Challenge', xp: 500, date: '2026-06-13', icon: '⭐', category: 'Challenge' },
  ],
};

const categories = ['All', 'Learning', 'Challenge', 'Quiz', 'Streak', 'Achievement'];

export default function XPPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('');
  const [xpData, setXPData] = useState(mockXPData);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      const p = await params;
      setLocale(p.locale);
    };
    initPage();
  }, [params]);

  useEffect(() => {
    const fetchXP = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/xp/balance');
        const data = await response.json();
        if (data.xp) {
          setXPData(data.xp);
        }
      } catch (error) {
        console.error('Error fetching XP:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchXP();
  }, []);

  const filteredActivities = selectedCategory === 'All'
    ? xpData.activities
    : xpData.activities.filter((a) => a.category === selectedCategory);

  const progressPercentage = (xpData.currentXP / xpData.nextLevelXP) * 100;

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0d1f38] border-r border-white/6 flex flex-col min-h-screen sticky top-0 shrink-0">
        <div className="p-5 border-b border-white/6">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">KURDAMUZ</div>
              <div className="text-xs text-emerald-400">کوردآموز</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { icon: '📊', label: 'Dashboard', href: `/${locale}/dashboard` },
            { icon: '📖', label: 'Learn', href: `/${locale}/dashboard/learning` },
            { icon: '🎓', label: 'Courses', href: `/${locale}/courses` },
            { icon: '🎯', label: 'Practice', href: `/${locale}/srs` },
            { icon: '👥', label: 'Community', href: `/${locale}/community` },
            { icon: '🏆', label: 'Leaderboard', href: `/${locale}/leaderboard` },
            { icon: '⭐', label: 'Achievements', href: `/${locale}/achievements` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-white hover:bg-white/5`}>
              <span className="text-base">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-400" />
                XP Progress
              </h1>
              <p className="text-slate-400 text-sm mt-1">Track your experience points and level progression.</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Level Progress Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm mb-2">Current Level</p>
                <p className="text-5xl font-bold text-white">{xpData.level}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-2">Total XP Earned</p>
                <p className="text-4xl font-bold text-emerald-400">{xpData.totalXP.toLocaleString()}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progress to Level {xpData.level + 1}</span>
                <span className="text-sm font-semibold text-emerald-400">
                  {xpData.currentXP.toLocaleString()} / {xpData.nextLevelXP.toLocaleString()} XP
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">{Math.round(progressPercentage)}% complete</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">This Week</p>
                  <p className="text-3xl font-bold text-white">{xpData.thisWeek.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
              <p className="text-xs text-slate-400">XP earned this week</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">This Month</p>
                  <p className="text-3xl font-bold text-white">{xpData.thisMonth.toLocaleString()}</p>
                </div>
                <Award className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
              <p className="text-xs text-slate-400">XP earned this month</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Average Daily</p>
                  <p className="text-3xl font-bold text-white">{Math.round(xpData.thisWeek / 7).toLocaleString()}</p>
                </div>
                <Target className="w-8 h-8 text-orange-400 opacity-50" />
              </div>
              <p className="text-xs text-slate-400">XP per day (this week)</p>
            </div>
          </div>

          {/* Activity Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Activities */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-white/10">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{activity.title}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      {activity.xp}
                    </p>
                    <p className="text-xs text-slate-400">{activity.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
