import { getCurrentUser, getCurrentUserRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3, Users, BookOpen, GraduationCap, Bell, Settings,
  TrendingUp, Activity, Database, Shield, Cpu,
  FileText, Image,
  Search, Plus, Clock, Zap
} from 'lucide-react';
import { db } from '@/db';
import { courses, lessons, xpTransactions, userLevels } from '@/db/schema';
import { sql, desc } from 'drizzle-orm';

type XPTransactionRow = typeof xpTransactions.$inferSelect;

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    console.error('Admin dashboard data source failed, using fallback:', err);
    return fallback;
  }
}

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) redirect(`/${locale}/login`);

  const userRole = (await getCurrentUserRole()) || 'student';
  if (!['admin_super', 'owner'].includes(userRole)) {
    redirect(`/${locale}/dashboard`);
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';

  // ── Real platform data from tables guaranteed to exist in db/schema.ts.
  // Revenue has no backing table (no payments/subscriptions system yet) so
  // it is intentionally NOT shown here as a real number — see Coming Soon
  // sections below instead of a fabricated dollar figure.
  const [totalLevelsTracked, totalCourses, totalLessons, totalXpResult, recentXpActivity] = await Promise.all([
    safe(db.select({ count: sql<number>`count(*)` }).from(userLevels), [{ count: 0 }]),
    safe(db.select({ count: sql<number>`count(*)` }).from(courses), [{ count: 0 }]),
    safe(db.select({ count: sql<number>`count(*)` }).from(lessons), [{ count: 0 }]),
    safe(db.select({ total: sql<number>`coalesce(sum(${xpTransactions.xpAmount}), 0)` }).from(xpTransactions), [{ total: 0 }]),
    safe(db.select().from(xpTransactions).orderBy(desc(xpTransactions.createdAt)).limit(5), [] as XPTransactionRow[]),
  ]);

  const activeLearnerProfiles = Number(totalLevelsTracked[0]?.count ?? 0);
  const courseCount = Number(totalCourses[0]?.count ?? 0);
  const lessonCount = Number(totalLessons[0]?.count ?? 0);
  const totalXpEarned = Number(totalXpResult[0]?.total ?? 0);

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
              <div className="text-xs text-slate-500">Admin Dashboard</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-2">OVERVIEW</div>
          {[
            { icon: <BarChart3 className="w-4 h-4" />, label: 'Overview', href: `/${locale}/admin`, active: true },
            { icon: <Activity className="w-4 h-4" />, label: 'Analytics', href: `/${locale}/admin/xp` },
            { icon: <TrendingUp className="w-4 h-4" />, label: 'Revenue', href: `/${locale}/admin` },
            { icon: <Shield className="w-4 h-4" />, label: 'System Health', href: `/${locale}/admin` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {item.icon}{item.label}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">USER MANAGEMENT</div>
          {[
            { icon: <Users className="w-4 h-4" />, label: 'Users', href: `/${locale}/admin` },
            { icon: <Shield className="w-4 h-4" />, label: 'Roles & Permissions', href: `/${locale}/admin` },
            { icon: <Settings className="w-4 h-4" />, label: 'Administrators', href: `/${locale}/admin` },
            { icon: <FileText className="w-4 h-4" />, label: 'Activity Logs', href: `/${locale}/admin` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              {item.icon}{item.label}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">PLATFORM</div>
          {[
            { icon: <GraduationCap className="w-4 h-4" />, label: 'Courses', href: `/${locale}/admin/dialects` },
            { icon: <BookOpen className="w-4 h-4" />, label: 'Lessons', href: `/${locale}/admin/dialects` },
            { icon: <Image className="w-4 h-4" />, label: 'Media Library', href: `/${locale}/admin/media` },
            { icon: <FileText className="w-4 h-4" />, label: 'Content Review', href: `/${locale}/admin` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              {item.icon}{item.label}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2 mt-4">SYSTEM</div>
          {[
            { icon: <Database className="w-4 h-4" />, label: 'Database', href: `/${locale}/admin` },
            { icon: <Cpu className="w-4 h-4" />, label: 'API Management', href: `/${locale}/admin` },
            { icon: <Activity className="w-4 h-4" />, label: 'Integrations', href: `/${locale}/admin` },
            { icon: <Settings className="w-4 h-4" />, label: 'Settings', href: `/${locale}/admin` },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              {item.icon}{item.label}
            </Link>
          ))}
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-white">System Status</span>
          </div>
          <div className="text-xs text-slate-500">All systems operational</div>
        </div>

        {/* User */}
        <div className="p-4 border-t border-white/6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-xs font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Hi, {userName}</div>
              <div className="text-xs text-slate-400 capitalize">{userRole === 'admin_super' ? 'Admin Super' : userRole}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white">Welcome back, {userName} 👋</h1>
            <p className="text-sm text-slate-400 mt-0.5">Here&apos;s what&apos;s happening with your learning platform today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search users, courses, lessons..."
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 w-72 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/8 relative">
              <Bell className="w-4 h-4 text-slate-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-xs font-bold text-white flex items-center justify-center">3</div>
            </div>
            {/* TODO: Wire to existing content creation flow (story/course creation modal or page) */}
            <Link
              href={`/${locale}/admin/stories/create`}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Create New
            </Link>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Grid — real data from the database; no fabricated revenue/trend numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Active Learners', value: activeLearnerProfiles.toLocaleString(), icon: <Users className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { label: 'Total XP Earned', value: totalXpEarned.toLocaleString(), icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
              { label: 'Total Courses', value: courseCount.toLocaleString(), icon: <GraduationCap className="w-5 h-5" />, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { label: 'Total Lessons', value: lessonCount.toLocaleString(), icon: <BookOpen className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Charts Row — time-series trend data requires a daily/weekly
              aggregation job that doesn't exist yet, so these show an
              honest "Coming Soon" instead of fabricated day-by-day bars. */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* XP Growth */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">XP Growth</h3>
                  <div className="text-2xl font-bold text-white mt-1">{totalXpEarned.toLocaleString()} <span className="text-sm font-normal text-slate-500">total XP</span></div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-xs text-slate-500">Daily trend chart coming soon — requires a scheduled aggregation job.</p>
              </div>
            </div>

            {/* Active Learners */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">Active Learners</h3>
                  <div className="text-2xl font-bold text-white mt-1">{activeLearnerProfiles.toLocaleString()} <span className="text-sm font-normal text-slate-500">total</span></div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-xs text-slate-500">Daily active users trend coming soon — requires session/activity logging.</p>
              </div>
            </div>

            {/* Lesson Completion */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">Lesson Completion</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-xs text-slate-500">Completion-rate analytics coming soon — requires lesson attempt tracking aggregation.</p>
              </div>
            </div>
          </div>

          {/* Recent Activity + Media Manager */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity — real recent XP transactions, not fabricated events */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white">Recent Activity</h3>
                <Link href={`/${locale}/admin/xp`} className="text-xs text-emerald-400 font-semibold">View All</Link>
              </div>
              {recentXpActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentXpActivity.map((tx: any) => (
                    <div key={tx.id} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center text-base shrink-0">
                        <Zap className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white capitalize">{(tx.sourceType || 'XP activity').replace(/_/g, ' ')}</div>
                        <div className="text-xs text-slate-400 truncate">+{tx.xpAmount} XP awarded</div>
                      </div>
                      <div className="text-xs text-slate-600 shrink-0">{new Date(tx.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="w-6 h-6 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-500">No recent activity yet.</p>
                </div>
              )}
            </div>

            {/* Media Manager — Coming Soon: no media_assets table is wired up yet */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white">Media Manager</h3>
                <Link href={`/${locale}/admin/media`} className="text-xs text-emerald-400 font-semibold">Open</Link>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Image className="w-7 h-7 text-amber-400 mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Coming Soon</div>
                <p className="text-xs text-slate-500 max-w-xs">A unified media library backed by real uploaded-asset records will appear here once the storage integration is wired up.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
