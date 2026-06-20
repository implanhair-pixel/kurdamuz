import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BookOpen, MessageSquare, Heart, Share2, Bookmark, TrendingUp, Users, Bell, Plus, Search } from 'lucide-react';
import { db } from '@/db';
import { communityPosts, communityComments, communityReactions, communityProfiles } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { requireCommunityPermission } from '@/lib/auth';
import { getPosts } from '@/lib/community/posts';

type CommunityFeedPost = Awaited<ReturnType<typeof getPosts>>[number];

const categoryColors: Record<string, string> = {
  Achievement: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Question: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Milestone: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Tip: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  Discussion: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function humanizePostType(postType: string) {
  switch (postType) {
    case 'question':
      return 'Question';
    case 'tip':
      return 'Tip';
    case 'success':
      return 'Achievement';
    case 'experience':
      return 'Milestone';
    default:
      return 'Discussion';
  }
}

interface SidebarItem {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
}

function extractTrendingTopics(posts: CommunityFeedPost[]) {
  const counts = new Map<string, number>();

  for (const entry of posts) {
    const text = `${entry.post.title} ${entry.post.content}`.toLowerCase();
    const hashtags = text.match(/#[\p{L}\p{N}_-]+/gu) || [];
    for (const tag of hashtags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  if (counts.size === 0) {
    for (const entry of posts.slice(0, 6)) {
      const label = `#${entry.post.postType.replace(/_/g, '')}`;
      counts.set(label, (counts.get(label) || 0) + 1);
    }
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag, count]) => ({ tag, count }));
}

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireCommunityPermission('read:posts').catch(() => null);

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [posts, topContributors, recentCounts, totalPostsRow, totalCommentsRow, totalReactionsRow, totalUsersRow, activeUsersRow] = await Promise.all([
    getPosts({ page: 1, limit: 12, sortBy: 'trending' }),
    db
      .select({
        id: communityProfiles.id,
        displayName: communityProfiles.displayName,
        reputationScore: communityProfiles.reputationScore,
        postCount: communityProfiles.postCount,
        commentCount: communityProfiles.commentCount,
      })
      .from(communityProfiles)
      .orderBy(desc(communityProfiles.reputationScore), desc(communityProfiles.postCount))
      .limit(3),
    db
      .select({ postType: communityPosts.postType, count: sql<number>`count(*)` })
      .from(communityPosts)
      .where(eq(communityPosts.status, 'published'))
      .groupBy(communityPosts.postType),
    db.select({ value: sql<number>`count(*)` }).from(communityPosts),
    db.select({ value: sql<number>`count(*)` }).from(communityComments),
    db.select({ value: sql<number>`count(*)` }).from(communityReactions),
    db.select({ value: sql<number>`count(*)` }).from(communityProfiles),
    db
      .select({ value: sql<number>`count(*)` })
      .from(communityProfiles)
      .where(sql`COALESCE(${communityProfiles.postCount}, 0) > 0 OR COALESCE(${communityProfiles.commentCount}, 0) > 0`),
  ]);

  const totalPosts = Number(totalPostsRow[0]?.value ?? 0);
  const totalComments = Number(totalCommentsRow[0]?.value ?? 0);
  const totalReactions = Number(totalReactionsRow[0]?.value ?? 0);
  const totalUsers = Number(totalUsersRow[0]?.value ?? 0);
  const activeUsers = Number(activeUsersRow[0]?.value ?? 0);
  const trendingTopics = extractTrendingTopics(posts);

  const feedPosts = posts.map((row) => ({
    id: row.post.id,
    author: {
      name: row.author.displayName,
      avatar: initials(row.author.displayName),
      color: 'from-emerald-500 to-teal-400',
      level: Math.max(1, Math.ceil((row.author.reputationScore || 0) / 25) + 1),
      badge: row.post.postType === 'question' ? '❓' : row.post.postType === 'tip' ? '💡' : '⭐',
    },
    time: row.post.createdAt ? new Date(row.post.createdAt).toLocaleString() : 'Just now',
    content: row.post.content,
    kurdish: row.post.title,
    likes: row.post.reactionCount || 0,
    comments: row.post.commentCount || 0,
    shares: Math.max(0, Math.floor((row.post.viewCount || 0) / 8)),
    tags: [row.post.postType, humanizePostType(row.post.postType).toLowerCase()].filter(Boolean),
    category: humanizePostType(row.post.postType),
  }));

  const recentPostsThisWeek = recentCounts.reduce((sum, row) => sum + Number(row.count || 0), 0);

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
          {([
            { icon: '📊', label: 'Dashboard', href: `/${locale}/dashboard` },
            { icon: '📖', label: 'Learn', href: `/${locale}/dashboard/learning` },
            { icon: '🎓', label: 'Courses', href: `/${locale}/courses` },
            { icon: '🎯', label: 'Practice', href: `/${locale}/srs` },
            { icon: '👥', label: 'Community', href: `/${locale}/community`, active: true },
            { icon: '🏆', label: 'Leaderboard', href: `/${locale}/leaderboard` },
            { icon: '⭐', label: 'Achievements', href: `/${locale}/achievements` },
          ] as SidebarItem[]).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${item.active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <span className="text-base">{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Community
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              {totalUsers.toLocaleString()} members · {activeUsers.toLocaleString()} active this cycle
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Search discussions..."
                className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 w-56 focus:outline-none focus:border-emerald-500"
                readOnly
              />
            </div>
            <button className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-slate-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-xs font-bold text-white flex items-center justify-center">3</div>
            </button>
            <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <Plus className="w-3.5 h-3.5" />
              New Post
            </button>
          </div>
        </div>

        <div className="flex p-6 gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {['All Posts', 'Questions', 'Achievements', 'Tips', 'Milestones'].map((tab) => (
                <button
                  key={tab}
                  className={`text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${tab === 'All Posts' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 bg-white/3 hover:text-white hover:bg-white/5 border border-white/6'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: 'Total Posts', value: totalPosts },
                { label: 'Total Comments', value: totalComments },
                { label: 'Total Reactions', value: totalReactions },
              ].map((item) => (
                <div key={item.label} className="bg-[#0d1f38] border border-white/8 rounded-2xl p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{item.label}</div>
                  <div className="mt-2 text-2xl font-bold text-white">{item.value.toLocaleString()}</div>
                </div>
              ))}
            </div>

            {feedPosts.length === 0 ? (
              <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-8 text-center text-slate-400">
                No community posts yet.
              </div>
            ) : (
              feedPosts.map((post) => (
                <div key={post.id} className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5 hover:border-white/12 transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${post.author.color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                      {post.author.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{post.author.name}</span>
                        <span className="text-base">{post.author.badge}</span>
                        <span className="text-xs bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">Lv {post.author.level}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryColors[post.category] || categoryColors.Discussion}`}>
                          {post.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{post.time}</div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-3">{post.content}</p>

                  {post.kurdish && (
                    <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-3" dir="auto">
                      <p className="text-sm text-emerald-300 font-medium">{post.kurdish}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white/4 border border-white/8 text-slate-500 px-2 py-0.5 rounded-full hover:text-slate-300 cursor-pointer transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-5 pt-4 border-t border-white/5">
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{post.comments} replies</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="font-medium">Share</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors ml-auto">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="w-64 shrink-0 space-y-4">
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Community Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Members', value: totalUsers.toLocaleString(), icon: <Users className="w-4 h-4 text-blue-400" /> },
                  { label: 'Active Today', value: activeUsers.toLocaleString(), icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
                  { label: 'Posts This Week', value: recentPostsThisWeek.toLocaleString(), icon: <MessageSquare className="w-4 h-4 text-purple-400" /> },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      {stat.icon}
                      {stat.label}
                    </div>
                    <span className="text-sm font-bold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Trending Topics</h3>
              <div className="space-y-2.5">
                {trendingTopics.map((topic) => (
                  <div key={topic.tag} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm text-emerald-400 font-medium group-hover:text-emerald-300 transition-colors">{topic.tag}</span>
                    <span className="text-xs text-slate-500">{topic.count} posts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {topContributors.map((contrib, index) => (
                  <div key={contrib.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {initials(contrib.displayName)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{contrib.displayName}</div>
                      <div className="text-xs text-slate-500">{Number(contrib.postCount || 0) + Number(contrib.commentCount || 0)} contributions</div>
                    </div>
                    <span className="text-base">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
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
