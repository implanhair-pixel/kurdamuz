'use client';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Star, Trophy, Flame, Zap, Lock, CheckCircle, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const categories = ['All', 'Milestones', 'Streaks', 'Skills', 'Community'];

const mockAchievements = [
  { id: 1, title: 'First Steps', desc: 'Complete your first lesson', icon: '🎯', xp: 50, coins: 10, earned: true, date: 'Dec 1, 2024', category: 'Milestones' },
  { id: 2, title: 'Week Warrior', desc: 'Maintain a 7-day streak', icon: '🔥', xp: 150, coins: 30, earned: true, date: 'Dec 8, 2024', category: 'Streaks' },
  { id: 3, title: 'Grammar Expert', desc: 'Complete 50 grammar lessons', icon: '📚', xp: 300, coins: 60, earned: true, date: 'Dec 15, 2024', category: 'Skills' },
  { id: 4, title: 'Daily Learner', desc: 'Learn 7 days in a row', icon: '⚡', xp: 100, coins: 20, earned: true, date: 'Dec 10, 2024', category: 'Streaks' },
  { id: 5, title: 'Vocab Master', desc: 'Learn 200 vocabulary words', icon: '📖', xp: 200, coins: 40, earned: false, progress: 145, total: 200, category: 'Skills' },
  { id: 6, title: 'Conversation Pro', desc: 'Complete 30 conversation lessons', icon: '💬', xp: 250, coins: 50, earned: false, progress: 18, total: 30, category: 'Skills' },
  { id: 7, title: 'Lesson Master', desc: 'Complete 100 lessons total', icon: '🏆', xp: 500, coins: 100, earned: false, progress: 67, total: 100, category: 'Milestones' },
  { id: 8, title: 'Month Warrior', desc: 'Maintain a 30-day streak', icon: '🌟', xp: 500, coins: 100, earned: false, progress: 12, total: 30, category: 'Streaks' },
  { id: 9, title: 'Kurdish Expert', desc: 'Reach Level 25', icon: '👑', xp: 1000, coins: 200, earned: false, progress: 7, total: 25, category: 'Milestones' },
  { id: 10, title: 'Speed Reader', desc: 'Read 20 stories in one week', icon: '⚡', xp: 200, coins: 40, earned: false, progress: 3, total: 20, category: 'Skills' },
  { id: 11, title: 'Perfect Score', desc: 'Get 100% on 10 quizzes', icon: '💯', xp: 300, coins: 60, earned: false, progress: 4, total: 10, category: 'Skills' },
  { id: 12, title: 'Community Star', desc: 'Help 50 other learners', icon: '⭐', xp: 400, coins: 80, earned: false, progress: 0, total: 50, category: 'Community' },
];

export default function AchievementsPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('');
  const [achievements, setAchievements] = useState(mockAchievements);
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
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/achievements');
        const data = await response.json();
        if (data.achievements && data.achievements.length > 0) {
          setAchievements(data.achievements);
        }
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const filteredAchievements = selectedCategory === 'All' 
    ? achievements 
    : achievements.filter((a: any) => a.category === selectedCategory);

  const earned = achievements.filter((a: any) => a.earned);
  const totalXP = earned.reduce((sum, a: any) => sum + a.xp, 0);

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
            { icon: '⭐', label: 'Achievements', href: `/${locale}/achievements`, active: true },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${(item as any).active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
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
                <Star className="w-6 h-6 text-amber-400" />
                Achievements
              </h1>
              <p className="text-slate-400 text-sm mt-1">Track your milestones and earn rewards as you learn Kurdish.</p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-white">{earned.length}/{achievements.length}</div>
                <div className="text-xs text-slate-400">Earned</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-emerald-400">{totalXP.toLocaleString()}</div>
                <div className="text-xs text-emerald-400">Total XP</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Category Filter */}
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

          {/* Achievements Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className={`relative rounded-2xl border overflow-hidden transition-all hover:shadow-2xl ${
                    achievement.earned
                      ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  {!achievement.earned && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                      <Lock className="w-8 h-8 text-white/50" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{achievement.icon}</div>
                      {achievement.earned && (
                        <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-full p-2">
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-1">{achievement.title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{achievement.desc}</p>

                    {/* Progress Bar */}
                    {!achievement.earned && achievement.progress !== undefined && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-400">Progress</span>
                          <span className="text-xs font-semibold text-emerald-400">
                            {achievement.progress}/{achievement.total}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (achievement.progress / achievement.total) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rewards */}
                    <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">{achievement.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">₵</span>
                        <span className="text-sm font-semibold text-white">{achievement.coins}</span>
                      </div>
                      {achievement.earned && achievement.date && (
                        <span className="text-xs text-slate-400 ml-auto">{achievement.date}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredAchievements.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No achievements in this category yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
