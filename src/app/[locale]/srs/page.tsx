import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Brain, Zap, Clock, Target, TrendingUp, ChevronRight, CheckCircle, Star } from 'lucide-react';

const srsSessions = [
  { type: 'Daily Review', count: 24, urgency: 'high', icon: '🔄', desc: 'Cards due for review today', color: 'border-emerald-500/30 bg-emerald-500/5', accent: 'text-emerald-400', btn: 'from-emerald-500 to-emerald-600' },
  { type: 'New Cards', count: 12, urgency: 'medium', icon: '✨', desc: 'New vocabulary to learn', color: 'border-blue-500/30 bg-blue-500/5', accent: 'text-blue-400', btn: 'from-blue-500 to-blue-600' },
  { type: 'Mastery Test', count: 8, urgency: 'low', icon: '🏆', desc: 'Test your mastered cards', color: 'border-purple-500/30 bg-purple-500/5', accent: 'text-purple-400', btn: 'from-purple-500 to-purple-600' },
];

const recentCards = [
  { word: 'سلاو', transliteration: 'Slâw', meaning: 'Hello', mastery: 92, interval: '7 days', status: 'mature' },
  { word: 'ناو', transliteration: 'Naw', meaning: 'Name', mastery: 78, interval: '3 days', status: 'learning' },
  { word: 'سوپاس', transliteration: 'Supas', meaning: 'Thank you', mastery: 85, interval: '5 days', status: 'mature' },
  { word: 'بە خێر بێیت', transliteration: 'Be xêr bêyt', meaning: 'Welcome', mastery: 45, interval: '1 day', status: 'new' },
  { word: 'چۆنی', transliteration: 'Çonî', meaning: 'How are you', mastery: 60, interval: '2 days', status: 'learning' },
];

const masteryColors: Record<string, string> = {
  mature: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  learning: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  new: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
};

export default async function SRSPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

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
            { icon: '📚', label: 'Library', href: `/${locale}/stories` },
            { icon: '🎯', label: 'Practice', href: `/${locale}/srs`, active: true },
            { icon: '👥', label: 'Community', href: `/${locale}/community` },
            { icon: '🏆', label: 'Leaderboard', href: `/${locale}/leaderboard` },
            { icon: '⭐', label: 'Achievements', href: `/${locale}/achievements` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${(item as any).active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <span className="text-base">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Spaced Repetition Practice
              </h1>
              <p className="text-slate-400 text-sm mt-1">Smart flashcard system that adapts to your learning pace.</p>
            </div>
            <div className="flex gap-4 text-center">
              <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-white">248</div>
                <div className="text-xs text-slate-400">Total Cards</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-emerald-400">78%</div>
                <div className="text-xs text-slate-400">Avg Mastery</div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                <div className="text-xl font-bold text-purple-400">12</div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Session Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {srsSessions.map((session) => (
              <div key={session.type} className={`bg-[#0d1f38] border rounded-2xl p-6 ${session.color}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{session.icon}</span>
                  <span className={`text-3xl font-bold ${session.accent}`}>{session.count}</span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{session.type}</h3>
                <p className="text-xs text-slate-400 mb-4">{session.desc}</p>
                <Link
                  href={`/${locale}/srs/daily`}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r ${session.btn} text-white text-sm font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition-all`}
                >
                  Start Session
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Cards Reviewed Today', value: '36', icon: <CheckCircle className="w-4 h-4 text-emerald-400" />, trend: '+8 from yesterday' },
              { label: 'Accuracy Rate', value: '82%', icon: <Target className="w-4 h-4 text-blue-400" />, trend: '+5% this week' },
              { label: 'Time Spent Today', value: '24m', icon: <Clock className="w-4 h-4 text-purple-400" />, trend: 'Goal: 30m' },
              { label: 'XP from Practice', value: '180', icon: <Zap className="w-4 h-4 text-amber-400" />, trend: 'Today' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0d1f38] border border-white/8 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {stat.icon}
                  <span className="text-xs text-slate-400">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.trend}</div>
              </div>
            ))}
          </div>

          {/* Recent Cards */}
          <div className="bg-[#0d1f38] border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
              <h3 className="text-base font-bold text-white">Recent Cards</h3>
              <Link href={`/${locale}/srs/mastery`} className="text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                View All Cards
              </Link>
            </div>
            <div className="divide-y divide-white/4">
              {recentCards.map((card, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-all">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-base font-bold text-white shrink-0" dir="rtl">
                    {card.word.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-white" dir="rtl">{card.word}</span>
                      <span className="text-xs text-slate-500">{card.transliteration}</span>
                    </div>
                    <div className="text-xs text-slate-400">{card.meaning}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-white">{card.mastery}%</div>
                      <div className="text-xs text-slate-500">Mastery</div>
                    </div>
                    <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${card.mastery >= 80 ? 'bg-emerald-400' : card.mastery >= 50 ? 'bg-blue-400' : 'bg-amber-400'}`}
                        style={{ width: `${card.mastery}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-slate-400">{card.interval}</div>
                      <div className="text-xs text-slate-600">next review</div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${masteryColors[card.status]}`}>
                      {card.status}
                    </span>
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
