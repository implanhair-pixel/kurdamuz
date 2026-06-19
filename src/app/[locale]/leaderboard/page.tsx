'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Trophy, Flame, Star, Crown, TrendingUp, Medal, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<any>(null);
  const [timeframe, setTimeframe] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initPage = async () => {
      const p = await params;
      setLocale(p.locale);
    };
    initPage();
  }, [params]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}&limit=50`);
      const data = await response.json();
      
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard.leaderboard || []);
        setUserRank(data.leaderboard.userPosition || null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const topThree = leaderboard.slice(0, 3);
  const restLeaderboard = leaderboard.slice(3);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      'from-amber-500 to-yellow-400',
      'from-slate-400 to-slate-300',
      'from-orange-600 to-amber-600',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-violet-500',
      'from-emerald-500 to-teal-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-500',
    ];
    return colors[index % colors.length];
  };

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
            { icon: '🏆', label: 'Leaderboard', href: `/${locale}/leaderboard`, active: true },
            { icon: '⭐', label: 'Achievements', href: `/${locale}/achievements` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${(item as any).active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <span className="text-base">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                Global Leaderboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Compete with Kurdish learners worldwide. Updated every hour.</p>
            </div>
            <div className="flex gap-2">
              {['weekly', 'monthly', 'all_time'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTimeframe(tab)}
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                    timeframe === tab
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 bg-white/5 hover:text-white border border-white/8'
                  }`}
                >
                  {tab === 'weekly' ? 'Weekly' : tab === 'monthly' ? 'Monthly' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Top 3 */}
          {topThree.length > 0 && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThree.map((user, index) => (
                <div
                  key={user.id}
                  className={`relative rounded-2xl border overflow-hidden transition-all hover:shadow-2xl ${
                    index === 0
                      ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 md:col-span-2 md:row-span-2'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  {/* Medal */}
                  <div className="absolute top-4 right-4 text-3xl">{getMedalIcon(index + 1)}</div>

                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getAvatarColor(index)} flex items-center justify-center font-bold text-white text-2xl shadow-lg`}>
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-400">Rank #{user.rank || index + 1}</div>
                        <h3 className="text-xl font-bold text-white">{user.displayName || 'Unknown'}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          {user.country && <span className="text-lg">{user.country}</span>}
                          {user.badge && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">{user.badge}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                      <div>
                        <div className="text-sm text-slate-400">XP</div>
                        <div className="text-lg font-bold text-white">{user.totalXP?.toLocaleString() || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Streak</div>
                        <div className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {user.currentStreak || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">Level</div>
                        <div className="text-lg font-bold text-white">{user.currentLevel || 1}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rest of leaderboard */}
          <div className="space-y-2">
            {restLeaderboard.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="text-lg font-bold text-slate-400 w-8 text-center">#{user.rank || index + 4}</div>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAvatarColor(index + 3)} flex items-center justify-center font-bold text-white text-sm`}>
                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{user.displayName || 'Unknown'}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    {user.country && <span>{user.country}</span>}
                    <span>Level {user.currentLevel || 1}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm text-slate-400">XP</div>
                    <div className="font-bold text-white">{user.totalXP?.toLocaleString() || 0}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Streak</div>
                    <div className="font-bold text-emerald-400 flex items-center gap-1 justify-end">
                      <Flame className="w-4 h-4" />
                      {user.currentStreak || 0}
                    </div>
                  </div>
                  {user.change && (
                    <div className={`flex items-center gap-1 ${user.change === 'up' ? 'text-emerald-400' : user.change === 'down' ? 'text-red-400' : 'text-slate-400'}`}>
                      {user.change === 'up' && <ArrowUp className="w-4 h-4" />}
                      {user.change === 'down' && <ArrowDown className="w-4 h-4" />}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="text-slate-400">Loading leaderboard...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 mb-3">{error}</div>
              <button
                onClick={() => fetchLeaderboard()}
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && leaderboard.length === 0 && (
            <div className="text-center py-8">
              <div className="text-slate-400">No leaderboard data available</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
