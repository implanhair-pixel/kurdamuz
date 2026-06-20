
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, BookOpen, CheckCircle, Globe, Star, Target, Zap } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('home');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const languageLinks = [
    { code: 'en', label: t('languages.en') },
    { code: 'fa', label: t('languages.fa') },
    { code: 'ckb', label: t('languages.ckb') },
  ];

  return (
    <main className="min-h-screen bg-[#0a1628] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/4 rounded-full blur-3xl" />
      </div>

      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-wide">{t('brand')}</span>
            <div className="text-xs text-emerald-400 font-medium -mt-0.5">{t('subtitle')}</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#learn" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">{t('nav.learn')}</Link>
          <Link href="#courses" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">{t('nav.courses')}</Link>
          <Link href="#community" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">{t('nav.community')}</Link>
          <Link href={`/${locale}/vocabulary`} className="text-sm text-slate-300 hover:text-white transition-colors font-medium">{t('nav.vocabulary')}</Link>
          <Link href={`/${locale}/grammar`} className="text-sm text-slate-300 hover:text-white transition-colors font-medium">{t('nav.grammar')}</Link>
          <Link href="#progress" className="text-sm text-slate-300 hover:text-white transition-colors font-medium">{t('nav.progress')}</Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 mr-2">
            {languageLinks.map((lang, index) => (
              <div key={lang.code} className="flex items-center gap-3">
                <Link href={`/${lang.code}`} className="text-sm text-slate-400 hover:text-white transition-colors">{lang.label}</Link>
                {index < languageLinks.length - 1 && <span className="text-slate-600">|</span>}
              </div>
            ))}
          </div>
          <Link
            href={`/${locale}/login`}
            className="text-sm font-semibold text-slate-200 hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 transition-all"
          >
            {t('login')}
          </Link>
          <Link
            href={`/${locale}/signup`}
            className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
          >
            {t('createAccount')}
          </Link>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8 text-sm text-emerald-400 font-medium">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {t('hero.badge')}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
              {t('hero.titleLine1')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                {t('hero.titleLine2')}
              </span>
            </h1>

            <p className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href={`/${locale}/signup`}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                {t('hero.startLearning')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/${locale}/courses`}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all"
              >
                <BookOpen className="w-4 h-4" />
                {t('hero.exploreCurriculum')}
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {['A', 'B', 'C', 'D'].map((label, i) => (
                  <div key={i} className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-[#0a1628] flex items-center justify-center text-xs font-bold text-white">
                    {label}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{t('hero.learnersCount')}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  <span className="text-xs text-slate-400 ml-1">{t('hero.rating')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative bg-[#0d1f38] border border-white/8 rounded-2xl p-6 shadow-2xl">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0f2440] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1">{t('stats.xpProgress')}</div>
                  <div className="text-2xl font-bold text-white">1,240 <span className="text-sm font-normal text-slate-400">XP</span></div>
                  <div className="mt-2 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full w-3/5 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full" />
                  </div>
                </div>
                <div className="bg-[#0f2440] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1">{t('stats.coins')}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-amber-900">₵</div>
                    <span className="text-2xl font-bold text-white">380</span>
                  </div>
                </div>
                <div className="bg-[#0f2440] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1">{t('stats.level')}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">7</span>
                  </div>
                </div>
                <div className="bg-[#0f2440] rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-medium mb-1">{t('stats.streak')}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-lg">🔥</span>
                    <span className="text-2xl font-bold text-white">12</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">{t('stats.streak')}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-bold text-white">12 {t('stats.streak')}</span>
                  </div>
                </div>
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="85 15" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-white">85%</span>
                    <span className="text-xs text-slate-400">{t('stats.xpProgress')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl px-4 py-2.5 shadow-xl shadow-emerald-500/30">
              <div className="text-xs font-medium text-emerald-100">{t('cta.title')}</div>
              <div className="text-lg font-bold text-white">+350 XP</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-b border-white/6 bg-white/2" id="progress">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '12,580', label: t('hero.learnersCount') },
              { value: '45,230', label: t('nav.courses') },
              { value: '128,450', label: t('stats.xpProgress') },
              { value: '1', label: t('stats.level') },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                </div>
                {i < 3 && <div className="hidden md:block w-px h-12 bg-white/8 ml-4" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16" id="courses">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
            <Target className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">{t('nav.learn')}</h3>
            <p className="text-slate-400 text-sm">{t('hero.subtitle')}</p>
          </div>
          <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
            <Globe className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">{t('nav.community')}</h3>
            <p className="text-slate-400 text-sm">{t('cta.subtitle')}</p>
          </div>
          <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
            <CheckCircle className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">{t('nav.progress')}</h3>
            <p className="text-slate-400 text-sm">{t('cta.noCard')}</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-20" id="community">
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('cta.title')}</h2>
            <p className="text-slate-300 max-w-2xl">{t('cta.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/signup`} className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-3 rounded-xl font-bold">
              {t('cta.createFreeAccount')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-5 py-3 rounded-xl font-semibold">
              <Zap className="w-4 h-4" />
              {t('cta.watchDemo')}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
