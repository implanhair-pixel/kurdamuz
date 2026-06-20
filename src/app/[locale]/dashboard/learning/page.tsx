import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, ChevronLeft, Flame, CheckCircle, Volume2,
  ArrowRight, Star, Headphones, BookMarked
} from 'lucide-react';

export default async function LearningPage({ params }: { params: Promise<{ locale: string }> }) {
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
            { icon: '📖', label: 'Learn', href: `/${locale}/dashboard/learning`, active: true },
            { icon: '🎓', label: 'Courses', href: `/${locale}/courses` },
            { icon: '📚', label: 'Library', href: `/${locale}/stories` },
            { icon: '🎯', label: 'Practice', href: `/${locale}/srs` },
            { icon: '👥', label: 'Community', href: `/${locale}/community` },
            { icon: '🏆', label: 'Leaderboard', href: `/${locale}/leaderboard` },
            { icon: '📈', label: 'Progress', href: `/${locale}/dashboard` },
            { icon: '⭐', label: 'Achievements', href: `/${locale}/achievements` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/6">
          <div className="text-xs text-slate-400 mb-1">Daily Goal</div>
          <div className="text-lg font-bold text-white mb-1">75% <span className="text-sm font-normal text-slate-400">45/60 XP</span></div>
          <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Lesson Header */}
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/courses`} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back to Courses
            </Link>
            <div className="w-px h-5 bg-white/10" />
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="w-48 h-2 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" style={{ width: '25%' }} />
              </div>
              <span className="text-sm font-medium text-slate-400">Lesson 12 of 48</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <div className="text-xs font-semibold text-slate-400">XP Reward</div>
              <div className="text-sm font-bold text-emerald-400">+120 XP</div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-white">12</span>
              <span className="text-xs text-slate-400">Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl">
              <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-amber-900">₵</div>
              <span className="text-sm font-bold text-white">380</span>
              <span className="text-xs text-slate-400">Coins</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Lesson Content */}
          <div className="flex-1 p-8">
            {/* Lesson Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Introduce Yourself</h1>
              <p className="text-slate-400 text-sm">Learn how to introduce yourself in Kurdish.</p>
            </div>

            {/* Main Content Card */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-8 mb-6">
              {/* Kurdish text display */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-3 leading-relaxed" dir="rtl" style={{ fontFamily: 'serif' }}>
                  سلاو، ناوم هۆسنه.
                </div>
                <div className="text-emerald-400 text-xl font-medium mb-2">Slâw, nawm Hôsen e.</div>
                <div className="text-slate-300 text-lg">Hi, my name is Hosen.</div>
              </div>

              {/* Show Translation toggle */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <button className="text-sm font-medium text-slate-400 hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-xl transition-all">
                  Show Translation
                </button>
                <select className="text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-xl focus:outline-none">
                  <option>English</option>
                  <option>فارسی</option>
                </select>
              </div>

              {/* Audio Player */}
              <div className="bg-white/5 border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <button className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
                    <Volume2 className="w-5 h-5 text-white" />
                  </button>
                  <div className="flex-1">
                    {/* Waveform */}
                    <div className="flex items-center gap-0.5 h-10 mb-2">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all ${i < 20 ? 'bg-emerald-400' : 'bg-white/20'}`}
                          style={{ height: `${Math.sin(i * 0.4) * 40 + 60}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0:00</span>
                      <span>2.5s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 bg-white/3 rounded-xl p-1">
              {['Learn', 'Practice', 'Quiz'].map((tab, i) => (
                <button key={tab} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${i === 2 ? 'bg-[#0d1f38] text-white shadow-sm border border-white/8' : 'text-slate-400 hover:text-white'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Quiz Section */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-5">Choose the correct translation:</h3>
              <div className="space-y-3">
                {[
                  { label: 'My name is Hosen.', correct: true },
                  { label: 'I am from Slemani.', correct: false },
                  { label: 'Nice to meet you.', correct: false },
                  { label: 'How are you?', correct: false },
                ].map((option, i) => (
                  <button
                    key={i}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:scale-[1.005] ${
                      option.correct
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-white/3 border-white/8 text-slate-300 hover:border-white/15 hover:bg-white/5'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-sm font-bold shrink-0 ${
                      option.correct ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-white/20 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {option.label}
                    {option.correct && <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Correct! <span className="text-white">+20 XP</span></span>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Vocabulary + Progress */}
          <div className="w-72 bg-[#0d1f38] border-l border-white/6 p-5 overflow-auto shrink-0">
            {/* Vocabulary */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Vocabulary</h3>
                <span className="text-xs text-slate-500">6 Words</span>
              </div>
              <div className="space-y-2">
                {[
                  { kd: 'سلاو', latin: 'Slâw', en: 'Hi' },
                  { kd: 'ناو', latin: 'Naw', en: 'Name' },
                  { kd: 'هۆسن', latin: 'Hôsen', en: 'Hosen' },
                  { kd: 'من', latin: 'Min', en: 'I / Me' },
                  { kd: 'هەستم باشە', latin: 'Hêstm base', en: 'I am good' },
                  { kd: 'سوپاس', latin: 'Supas', en: 'Thank you' },
                ].map((word, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-2">
                      <button className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0 hover:bg-emerald-500/20 transition-all">
                        <Headphones className="w-3 h-3 text-emerald-400" />
                      </button>
                      <div>
                        <div className="text-sm font-bold text-white" dir="rtl">{word.kd}</div>
                        <div className="text-xs text-slate-500">{word.latin}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{word.en}</span>
                      <Star className="w-3.5 h-3.5 text-slate-600 hover:text-amber-400 cursor-pointer transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                View All Words
                <ChevronLeft className="w-3 h-3 rotate-180" />
              </button>
            </div>

            {/* Lesson Progress */}
            <div>
              <h3 className="text-sm font-bold text-white mb-4">Lesson Progress</h3>
              <div className="relative w-28 h-28 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.5"
                    strokeDasharray="75 25" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.4))' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">75%</span>
                  <span className="text-xs text-slate-400">Complete</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Lessons Completed', value: '12/48' },
                  { label: 'XP Earned', value: '1,240' },
                  { label: 'Time Spent', value: '18m 45s' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
