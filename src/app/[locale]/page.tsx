import Link from 'next/link';
import { BookOpen, Users, Trophy, Star, ArrowRight, Zap, Target, Globe, BarChart3, CheckCircle, Play, ChevronRight } from 'lucide-react';

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-hidden">
      {/* Background mesh */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/4 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-teal-500/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wide">KURDAMUZ</span>
            <div className="text-xs text-emerald-400 font-medium -mt-0.5">کوردآموز</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">Learn</Link>
          <Link href="#courses" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">Courses</Link>
          <Link href="#community" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">Community</Link>
          <Link href="#progress" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">Progress</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 mr-2">
            <Link href="/en" className="text-sm text-slate-400 hover:text-white transition-colors">English</Link>
            <span className="text-slate-600">|</span>
            <Link href="/fa" className="text-sm text-slate-400 hover:text-white transition-colors">فارسی</Link>
            <span className="text-slate-600">|</span>
            <Link href="/ckb" className="text-sm text-slate-400 hover:text-white transition-colors">کوردی</Link>
          </div>
          <Link
            href="/en/login"
            className="text-sm font-semibold text-slate-200 hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all"
          >
            Login
          </Link>
          <Link
            href="/en/signup"
            className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
          >
            Create Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8 text-sm text-emerald-400 font-medium">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Advanced Kurdish Learning Platform
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
              Learn Kurdish
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                With Precision
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
              A modern learning platform combining structured progression,
              intelligent practice systems, and rewarding educational mechanics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/en/signup"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                Start Learning
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/en/courses"
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all"
              >
                <BookOpen className="w-4 h-4" />
                Explore Curriculum
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-green-500'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-[#0a1628] flex items-center justify-center text-xs font-bold text-white`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">12,580+ learners</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  <span className="text-xs text-slate-400 ml-1">4.9 rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Preview Card */}
          <div className="hidden lg:block relative">
            {/* XP Progress Card */}
            <div className="relative bg-[#0d1f38] border border-white/8 rounded-2xl p-6 shadow-2xl">
              {/* Header stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#0f2440] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1">XP Progress</div>
                  <div className="text-2xl font-bold text-white">1,240 <span className="text-sm font-normal text-slate-400">XP</span></div>
                  <div className="mt-2 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
                <div className="bg-[#0f2440] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1">Coins</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-amber-900">₵</div>
                    <span className="text-2xl font-bold text-white">380</span>
                  </div>
                </div>
                <div className="bg-[#0f2440] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1">Level</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">7</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Daily Streak</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🔥</span>
                    <span className="text-xl font-bold text-white">12 Days</span>
                  </div>
                </div>
                {/* Circular progress */}
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                      strokeDasharray="85 15" strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }} />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-white">85%</span>
                    <span className="text-xs text-slate-400">Progress</span>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">Achievements</span>
                  <span className="text-xs text-emerald-400 font-medium cursor-pointer">View All</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { icon: '📚', title: 'Grammar Expert', desc: 'Complete 50 grammar lessons', color: 'bg-blue-500/10 border-blue-500/20' },
                    { icon: '🔥', title: 'Daily Learner', desc: 'Learn 7 days in a row', color: 'bg-orange-500/10 border-orange-500/20' },
                    { icon: '🎓', title: 'Lesson Master', desc: 'Complete 100 lessons', color: 'bg-purple-500/10 border-purple-500/20' },
                  ].map((a, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-lg p-2.5 border ${a.color}`}>
                      <span className="text-lg">{a.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-white leading-none">{a.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{a.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl px-4 py-2.5 shadow-xl shadow-emerald-500/30">
              <div className="text-xs font-medium text-emerald-100">This Week</div>
              <div className="text-lg font-bold text-white">+350 XP</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 border-t border-b border-white/6 bg-white/2">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '12,580', label: 'Users Active Today', trend: '+12.5%' },
              { value: '45,230', label: 'Lessons Completed', trend: '+18.7%' },
              { value: '128,450', label: 'XP Earned This Week', trend: '+22.1%' },
              { value: '1', label: 'Top Learner Ranking', trend: '+5.3%' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                  <div className="text-xs text-emerald-400 font-semibold mt-1">↑ {stat.trend}</div>
                </div>
                {i < 3 && <div className="hidden md:block w-px h-12 bg-white/8 ml-4" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Modules */}
      <section id="courses" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Learning Modules</h2>
            <p className="text-slate-400 text-sm">Continue Your Journey</p>
          </div>
          <Link href="/en/courses" className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
            View All Modules
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { icon: '✕', title: 'Kurdish Alphabet', desc: 'Learn the Kurdish alphabet and pronunciation.', progress: 75, xp: '+120 XP', level: 'Level 1', color: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { icon: '📖', title: 'Essential Vocabulary', desc: 'Build your core vocabulary for daily use.', progress: 60, xp: '+150 XP', level: 'Level 2', color: 'from-blue-600 to-cyan-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
            { icon: '💬', title: 'Real Conversations', desc: 'Practice real-life conversations with contextual learning.', progress: 45, xp: '+200 XP', level: 'Level 3', color: 'from-purple-600 to-violet-600', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
            { icon: '⌨️', title: 'Grammar Builder', desc: 'Master Kurdish grammar step by step.', progress: 30, xp: '+180 XP', level: 'Level 4', color: 'from-orange-600 to-red-600', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
            { icon: '🎧', title: 'Listening Challenges', desc: 'Improve your listening skills with interactive audio.', progress: 20, xp: '+160 XP', level: 'Level 3', color: 'from-pink-600 to-rose-600', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
          ].map((module, i) => (
            <div key={i} className={`${module.bg} border ${module.border} rounded-2xl p-5 hover:scale-[1.02] transition-all cursor-pointer group`}>
              <div className={`w-10 h-10 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-white text-lg mb-4 shadow-lg`}>
                {module.icon}
              </div>
              <h3 className="font-bold text-white text-sm mb-1.5">{module.title}</h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">{module.desc}</p>

              <div className="mb-3">
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${module.color} rounded-full`}
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-emerald-400 font-semibold">{module.xp}</span>
                  <span className="text-xs text-slate-400">{module.level}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-white/2 border-t border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why KURDAMUZ?</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Built for serious learners who want measurable progress and premium learning experiences.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: 'Precision Learning',
                desc: 'SM-2 spaced repetition algorithm ensures vocabulary is reviewed at optimal intervals for maximum retention.',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/15',
              },
              {
                icon: <Trophy className="w-6 h-6" />,
                title: 'Gamified Progress',
                desc: 'Earn XP, unlock achievements, maintain streaks, and climb the leaderboard as you advance through levels.',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/15',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Vibrant Community',
                desc: 'Connect with thousands of Kurdish language learners. Share progress, ask questions, and learn together.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10 border-blue-500/15',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Daily Missions',
                desc: 'Complete daily challenges to earn bonus XP and coins. Build consistent habits that accelerate learning.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/15',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Detailed Analytics',
                desc: 'Track your learning velocity, accuracy rates, time spent, and skill breakdown across all domains.',
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10 border-cyan-500/15',
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: 'All Kurdish Dialects',
                desc: 'Sorani, Kurmanji, Southern Kurdish, Hawrami, and Zazaki — every major dialect covered in depth.',
                color: 'text-green-400',
                bg: 'bg-green-500/10 border-green-500/15',
              },
            ].map((f, i) => (
              <div key={i} className={`${f.bg} border rounded-2xl p-6 hover:scale-[1.01] transition-all`}>
                <div className={`${f.color} mb-4`}>{f.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dialects */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Kurdish Dialects</h2>
          <p className="text-slate-400">Every dialect with dedicated content and native pronunciation</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Sorani', native: 'سورانی', flag: '🇮🇶', color: 'from-emerald-600/80 to-teal-600/80', border: 'border-emerald-500/30', learners: '8,420' },
            { name: 'Kurmanji', native: 'کرمانجی', flag: '🇹🇷', color: 'from-red-600/80 to-rose-600/80', border: 'border-red-500/30', learners: '2,180' },
            { name: 'Southern', native: 'کردی جنوبی', flag: '🇮🇷', color: 'from-green-600/80 to-emerald-700/80', border: 'border-green-500/30', learners: '1,240' },
            { name: 'Hawrami', native: 'هورامی', flag: '🏔️', color: 'from-amber-600/80 to-orange-600/80', border: 'border-amber-500/30', learners: '480' },
            { name: 'Zazaki', native: 'زازا', flag: '⛰️', color: 'from-purple-600/80 to-indigo-600/80', border: 'border-purple-500/30', learners: '260' },
          ].map((d, i) => (
            <div key={i} className={`bg-gradient-to-br ${d.color} border ${d.border} rounded-2xl p-5 text-center hover:scale-105 transition-all cursor-pointer group`}>
              <div className="text-3xl mb-2.5">{d.flag}</div>
              <div className="font-bold text-white">{d.name}</div>
              <div className="text-sm text-white/70 mt-0.5">{d.native}</div>
              <div className="text-xs text-white/50 mt-2">{d.learners} learners</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="relative bg-gradient-to-br from-emerald-900/60 to-teal-900/60 border border-emerald-500/20 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
              <Star className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Learning Today</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Join 12,580+ learners mastering Kurdish. Free to start — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/en/signup"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-0.5"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/en/courses"
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all"
              >
                <Play className="w-4 h-4" />
                Watch Demo
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
              {['Free forever plan', 'No credit card', 'Cancel anytime'].map((t, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-white">KURDAMUZ</span>
                <span className="text-slate-500 text-sm ml-2">— Kurdish Language Platform</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/en/about" className="hover:text-slate-300 transition-colors">About</Link>
              <Link href="/en/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
              <Link href="/en/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
              <span>© 2026 KURDAMUZ</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
