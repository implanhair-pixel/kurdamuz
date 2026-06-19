import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, BarChart3, Users, TrendingUp, DollarSign, Shield,
  Globe, Activity, Crown, Server, Zap, Clock
} from 'lucide-react';
import { db } from '@/db';
import { courses, lessons, xpTransactions, userLevels } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    console.error('Owner dashboard data source failed, using fallback:', err);
    return fallback;
  }
}

export default async function OwnerDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const userRole = user.user_metadata?.role || 'student';
  if (!['owner', 'super_admin'].includes(userRole)) {
    redirect(`/${locale}/dashboard`);
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Owner';

  // ── Real platform data, pulled only from tables guaranteed to exist in
  // db/schema.ts. Anything without a backing table/source (revenue,
  // subscriptions, per-country breakdowns, admin activity logs) is
  // explicitly marked "Coming Soon" further down rather than shown as a
  // real number — those features have no schema support yet.
  //
  // Note: a true "total registered users" count would come from Supabase
  // Auth's admin API (supabaseAdmin.auth.admin.listUsers), but its response
  // shape differs across @supabase/supabase-js versions. To avoid a build
  // break from an API mismatch, we use "active learner profiles" (rows in
  // user_levels, created the moment a user first earns XP) as the
  // real-data proxy for now. Swap in the Auth admin API once the installed
  // SDK version's response shape is confirmed.
  const [totalCourses, totalLessons, totalXpAwardedResult, totalLevelsTracked] = await Promise.all([
    safe(db.select({ count: sql<number>`count(*)` }).from(courses), [{ count: 0 }]),
    safe(db.select({ count: sql<number>`count(*)` }).from(lessons), [{ count: 0 }]),
    safe(db.select({ total: sql<number>`coalesce(sum(${xpTransactions.xpAmount}), 0)` }).from(xpTransactions), [{ total: 0 }]),
    safe(db.select({ count: sql<number>`count(*)` }).from(userLevels), [{ count: 0 }]),
  ]);

  const courseCount = Number(totalCourses[0]?.count ?? 0);
  const lessonCount = Number(totalLessons[0]?.count ?? 0);
  const totalXpAwarded = Number(totalXpAwardedResult[0]?.total ?? 0);
  const activeLearnerProfiles = Number(totalLevelsTracked[0]?.count ?? 0);

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0d1f38] border-r border-white/6 flex flex-col min-h-screen sticky top-0 shrink-0">
        <div className="p-5 border-b border-white/6">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">KURDAMUZ</div>
              <div className="text-xs text-amber-400">Owner Console</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-2">OVERVIEW</div>
          {[
            { icon: <BarChart3 className="w-4 h-4" />, label: 'Overview', href: `/${locale}/owner`, active: true },
            { icon: <TrendingUp className="w-4 h-4" />, label: 'Analytics', href: `/${locale}/admin/xp` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {item.icon}{item.label}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">MANAGEMENT</div>
          {[
            { icon: <Shield className="w-4 h-4" />, label: 'Admin Dashboard', href: `/${locale}/admin` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              {item.icon}{item.label}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">COMING SOON</div>
          {[
            { icon: <DollarSign className="w-4 h-4" />, label: 'Revenue & Billing' },
            { icon: <Globe className="w-4 h-4" />, label: 'Global Reach' },
            { icon: <Server className="w-4 h-4" />, label: 'Infrastructure' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed">
              {item.icon}{item.label}
              <span className="ml-auto text-[10px] bg-white/5 border border-white/10 rounded-full px-1.5 py-0.5 text-slate-500">Soon</span>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-xs font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{userName}</div>
              <div className="text-xs text-amber-400 flex items-center gap-1"><Crown className="w-3 h-3" /> Owner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Owner Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Platform overview — live data where available</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Live Data</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Real KPIs — only metrics with a real backing data source */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Learners', value: activeLearnerProfiles.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { label: 'Published Courses', value: courseCount.toLocaleString(), icon: <BookOpen className="w-5 h-5" />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              { label: 'Total Lessons', value: lessonCount.toLocaleString(), icon: <Activity className="w-5 h-5" />, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
              { label: 'Total XP Awarded', value: totalXpAwarded.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            ].map((kpi, i) => (
              <div key={i} className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                <div className="text-xs text-slate-500">{kpi.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue — Coming Soon: no payments/subscriptions tables exist yet */}
            <div className="lg:col-span-2 bg-[#0d1f38] border border-white/8 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">Revenue Overview</h3>
                  <p className="text-xs text-slate-500 mt-1">Requires the Purchase Request &amp; billing system</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="w-8 h-8 text-amber-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Coming Soon</div>
                <p className="text-xs text-slate-500 max-w-xs">Revenue analytics will appear here once the Purchase Request and payment-instruction workflow is implemented and recording real transactions.</p>
              </div>
            </div>

            {/* System Health — Coming Soon: requires real infra monitoring (e.g. GlitchTip/Posthog) wiring */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-2">System Health</h3>
              <p className="text-xs text-slate-500 mb-6">Requires monitoring integration</p>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Clock className="w-7 h-7 text-amber-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Coming Soon</div>
                <p className="text-xs text-slate-500">Connect GlitchTip / PostHog to populate live infrastructure metrics here.</p>
              </div>
            </div>
          </div>

          {/* Admin Management + Global Stats — both Coming Soon, no backing tables yet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white">Admin Team Activity</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-7 h-7 text-amber-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Coming Soon</div>
                <p className="text-xs text-slate-500">Per-admin activity tracking requires an admin action audit log table.</p>
              </div>
            </div>

            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white">Global Reach</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-7 h-7 text-amber-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Coming Soon</div>
                <p className="text-xs text-slate-500">Per-country breakdown requires storing user location/locale on signup.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
