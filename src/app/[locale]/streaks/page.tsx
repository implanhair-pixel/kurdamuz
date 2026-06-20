'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Flame, Calendar, TrendingUp, Award, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

const mockStreakData = {
  current: 12,
  longest: 45,
  totalDays: 89,
  thisWeek: 5,
  thisMonth: 12,
  history: [
    { date: '2026-06-17', completed: true, xp: 120 },
    { date: '2026-06-16', completed: true, xp: 150 },
    { date: '2026-06-15', completed: true, xp: 100 },
    { date: '2026-06-14', completed: true, xp: 180 },
    { date: '2026-06-13', completed: true, xp: 140 },
    { date: '2026-06-12', completed: false, xp: 0 },
    { date: '2026-06-11', completed: true, xp: 160 },
    { date: '2026-06-10', completed: true, xp: 130 },
    { date: '2026-06-09', completed: true, xp: 110 },
    { date: '2026-06-08', completed: true, xp: 170 },
    { date: '2026-06-07', completed: true, xp: 125 },
    { date: '2026-06-06', completed: true, xp: 145 },
    { date: '2026-06-05', completed: false, xp: 0 },
    { date: '2026-06-04', completed: true, xp: 135 },
  ],
};

export default function StreaksPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('');
  const [streakData, setStreakData] = useState(mockStreakData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      const p = await params;
      setLocale(p.locale);
    };
    initPage();
  }, [params]);

  useEffect(() => {
    const fetchStreaks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/streaks');
        const data = await response.json();
        if (data.streaks) {
          setStreakData(data.streaks);
        }
      } catch (error) {
        console.error('Error fetching streaks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreaks();
  }, []);

  const getMonthCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const calendarDays = getMonthCalendar();

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
                <Flame className="w-6 h-6 text-orange-400" />
                Learning Streaks
              </h1>
              <p className="text-slate-400 text-sm mt-1">Keep your learning momentum going with daily streaks.</p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="text-2xl font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  {streakData.current}
                </div>
                <div className="text-xs text-slate-400">Current Streak</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
                <div className="text-2xl font-bold text-orange-400">{streakData.longest}</div>
                <div className="text-xs text-orange-400">Longest Streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Total Days Learned</p>
                  <p className="text-3xl font-bold text-white">{streakData.totalDays}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-400">Cumulative learning days</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">This Week</p>
                  <p className="text-3xl font-bold text-white">{streakData.thisWeek}/7</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-slate-400">Days completed this week</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">This Month</p>
                  <p className="text-3xl font-bold text-white">{streakData.thisMonth}/30</p>
                </div>
                <Award className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-xs text-slate-400">Days completed this month</p>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-6">June 2026</h2>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const historyEntry = streakData.history.find((h) => {
                  const date = new Date(h.date);
                  return date.getDate() === day;
                });

                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg flex items-center justify-center font-semibold transition-all ${
                      day === null
                        ? 'bg-transparent'
                        : historyEntry?.completed
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-105'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {day && (
                      <div className="text-center">
                        <div>{day}</div>
                        {historyEntry?.completed && (
                          <div className="text-xs mt-1">
                            <Flame className="w-3 h-3 inline" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent History */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {streakData.history.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    entry.completed
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      entry.completed
                        ? 'bg-emerald-500/20'
                        : 'bg-white/10'
                    }`}>
                      {entry.completed ? (
                        <Flame className="w-5 h-5 text-orange-400" />
                      ) : (
                        <Zap className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-slate-400">
                        {entry.completed ? 'Completed' : 'Missed'}
                      </p>
                    </div>
                  </div>
                  {entry.completed && (
                    <div className="text-right">
                      <p className="text-white font-semibold">{entry.xp} XP</p>
                      <p className="text-xs text-emerald-400">Earned</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
