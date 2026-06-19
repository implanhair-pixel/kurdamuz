'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, MessageSquare, Heart, Share2, Bookmark, TrendingUp, Users, Bell, Plus, Search } from 'lucide-react';

const posts = [
  {
    id: 1,
    author: { name: 'Sarwin K.', avatar: 'SK', color: 'from-amber-500 to-yellow-400', level: 28, badge: '🏆' },
    time: '2 hours ago',
    content: 'Just completed the Kurdish Alphabet course! The pronunciation guides are incredibly helpful. The audio recordings made it so much easier to get the sounds right. Recommend to all beginners! 🎉',
    kurdish: 'کتووم بە ڕووخساری کوردی. زۆر سوودمەندە!',
    likes: 24,
    comments: 8,
    shares: 3,
    tags: ['alphabet', 'beginner', 'milestone'],
    category: 'Achievement',
  },
  {
    id: 2,
    author: { name: 'Hema S.', avatar: 'HS', color: 'from-blue-500 to-cyan-400', level: 22, badge: '⭐' },
    time: '4 hours ago',
    content: 'Can someone help me understand the difference between Kurmanji and Sorani grammar? I\'m struggling with verb conjugation in the past tense.',
    likes: 15,
    comments: 12,
    shares: 1,
    tags: ['grammar', 'question', 'kurmanji'],
    category: 'Question',
  },
  {
    id: 3,
    author: { name: 'Diyar M.', avatar: 'DM', color: 'from-purple-500 to-violet-400', level: 18, badge: '🔥' },
    time: '6 hours ago',
    content: 'Reached 30-day streak today! 🔥 The daily practice reminders really keep me motivated. My Kurdish has improved so much in just one month. Starting to understand Kurdish TV shows!',
    likes: 47,
    comments: 16,
    shares: 8,
    tags: ['streak', 'motivation', 'progress'],
    category: 'Milestone',
  },
  {
    id: 4,
    author: { name: 'Roza A.', avatar: 'RA', color: 'from-rose-500 to-pink-400', level: 15, badge: '📚' },
    time: '1 day ago',
    content: 'Sharing my vocabulary flashcard system that helped me memorize 200+ words in two weeks. Create themed groups (food, family, places) and review them daily. Works amazingly!',
    likes: 89,
    comments: 23,
    shares: 15,
    tags: ['vocabulary', 'tips', 'study-method'],
    category: 'Tip',
  },
];

const trendingTopics = [
  { tag: '#alphabet', count: 234 },
  { tag: '#grammar', count: 189 },
  { tag: '#streak', count: 156 },
  { tag: '#vocabulary', count: 134 },
  { tag: '#kurmanji', count: 112 },
  { tag: '#sorani', count: 98 },
];

const categoryColors: Record<string, string> = {
  Achievement: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Question: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Milestone: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Tip: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
};

export default function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState('en');
  const [activeCategory, setActiveCategory] = useState('All Posts');
  const [showNewPost, setShowNewPost] = useState(false);

  // Resolve locale from params
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const categories = ['All Posts', 'Questions', 'Achievements', 'Tips', 'Milestones'];
  const categoryFilterMap: Record<string, string> = {
    'All Posts': 'all',
    'Questions': 'Question',
    'Achievements': 'Achievement',
    'Tips': 'Tip',
    'Milestones': 'Milestone',
  };

  const filteredPosts = activeCategory === 'All Posts'
    ? posts
    : posts.filter((post) => post.category === categoryFilterMap[activeCategory]);

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
            { icon: '👥', label: 'Community', href: `/${locale}/community`, active: true },
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
        <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Community
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Connect with 12,580+ Kurdish learners worldwide</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input placeholder="Search discussions..." className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 w-56 focus:outline-none focus:border-emerald-500" />
            </div>
            <button className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative">
              <Bell className="w-4 h-4 text-slate-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-xs font-bold text-white flex items-center justify-center">3</div>
            </button>
            <button
              onClick={() => setShowNewPost(!showNewPost)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              New Post
            </button>
          </div>
        </div>

        <div className="flex p-6 gap-6">
          {/* Feed */}
          <div className="flex-1 space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {categories.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCategory(tab)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-xl transition-all ${activeCategory === tab ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 bg-white/3 hover:text-white hover:bg-white/5 border border-white/6'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {showNewPost && (
              <div className="bg-[#0d1f38] border border-emerald-500/20 rounded-2xl p-5 mb-4">
                <p className="text-sm text-slate-400 mb-3">Create a new post to share with the community.</p>
                {/* TODO: Integrate PostEditor component and wire form submission to POST /api/community/posts */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewPost(false)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {filteredPosts.map((post) => (
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
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryColors[post.category]}`}>
                        {post.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{post.time}</div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-3">{post.content}</p>

                {post.kurdish && (
                  <div className="bg-white/3 border border-white/8 rounded-xl p-3 mb-3" dir="rtl">
                    <p className="text-sm text-emerald-300 font-medium">{post.kurdish}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map(tag => (
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
            ))}
          </div>

          {/* Right sidebar */}
          <div className="w-64 shrink-0 space-y-4">
            {/* Stats */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Community Stats</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Members', value: '12,580', icon: <Users className="w-4 h-4 text-blue-400" /> },
                  { label: 'Active Today', value: '2,450', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
                  { label: 'Posts This Week', value: '1,840', icon: <MessageSquare className="w-4 h-4 text-purple-400" /> },
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

            {/* Trending Topics */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Trending Topics</h3>
              <div className="space-y-2.5">
                {trendingTopics.map((topic, i) => (
                  <div key={topic.tag} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm text-emerald-400 font-medium group-hover:text-emerald-300 transition-colors">{topic.tag}</span>
                    <span className="text-xs text-slate-500">{topic.count} posts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-[#0d1f38] border border-white/8 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {[
                  { name: 'Sarwin K.', posts: 142, color: 'from-amber-500 to-yellow-400' },
                  { name: 'Diyar M.', posts: 98, color: 'from-purple-500 to-violet-400' },
                  { name: 'Hema S.', posts: 87, color: 'from-blue-500 to-cyan-400' },
                ].map((contrib, i) => (
                  <div key={contrib.name} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${contrib.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                      {contrib.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{contrib.name}</div>
                      <div className="text-xs text-slate-500">{contrib.posts} posts</div>
                    </div>
                    <span className="text-base">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </span>
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
