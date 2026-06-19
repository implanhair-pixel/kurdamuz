import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { StoriesGrid } from './StoriesGrid';

const stories = [
  {
    id: 1, title: 'The Mountain Village', titleKd: 'گوندی چیایی',
    level: 'Beginner', duration: '5 min', words: 120, xp: 40, rating: 4.9,
    category: 'Culture', audioAvailable: true, completed: true,
    desc: 'A short story about life in a traditional Kurdish mountain village.',
    color: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
  },
  {
    id: 2, title: 'The Newroz Festival', titleKd: 'جەژنی نەورۆز',
    level: 'Beginner', duration: '7 min', words: 180, xp: 60, rating: 4.8,
    category: 'Traditions', audioAvailable: true, completed: true,
    desc: 'Celebrate Newroz, the Kurdish New Year, through this festive story.',
    color: 'from-amber-600 to-orange-600', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
  },
  {
    id: 3, title: 'A Day at the Bazaar', titleKd: 'ڕۆژێک لە بازاڕ',
    level: 'Intermediate', duration: '10 min', words: 250, xp: 80, rating: 4.7,
    category: 'Daily Life', audioAvailable: true, completed: false,
    desc: 'Navigate the vibrant Kurdish bazaar and practice everyday conversation.',
    color: 'from-blue-600 to-cyan-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
  },
  {
    id: 4, title: 'The Kurdish Poet', titleKd: 'شاعیری کورد',
    level: 'Intermediate', duration: '12 min', words: 300, xp: 100, rating: 4.9,
    category: 'Literature', audioAvailable: false, completed: false,
    desc: 'Discover the rich tradition of Kurdish poetry through this inspiring tale.',
    color: 'from-purple-600 to-violet-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
  },
  {
    id: 5, title: 'The Ancient City', titleKd: 'شاری کۆن',
    level: 'Advanced', duration: '18 min', words: 450, xp: 150, rating: 4.8,
    category: 'History', audioAvailable: true, completed: false, locked: true,
    desc: 'Explore the ancient history of Kurdish civilization through this epic story.',
    color: 'from-rose-600 to-red-600', bg: 'bg-rose-500/10', border: 'border-rose-500/20',
  },
  {
    id: 6, title: 'Family Reunion', titleKd: 'کۆبوونەوەی خێزان',
    level: 'Beginner', duration: '6 min', words: 140, xp: 50, rating: 4.6,
    category: 'Family', audioAvailable: true, completed: false,
    desc: 'A heartwarming story about a Kurdish family reunion during Eid.',
    color: 'from-pink-600 to-rose-600', bg: 'bg-pink-500/10', border: 'border-pink-500/20',
  },
];

export default async function StoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
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
            { icon: '📚', label: 'Library', href: `/${locale}/stories`, active: true },
            { icon: '🎯', label: 'Practice', href: `/${locale}/srs` },
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
        <StoriesGrid locale={locale} stories={stories} />
      </main>
    </div>
  );
}
