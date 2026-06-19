'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Star, Lock, Play, Headphones, BookMarked } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  titleKd: string;
  level: string;
  duration: string;
  words: number;
  xp: number;
  rating: number;
  category: string;
  audioAvailable: boolean;
  completed: boolean;
  locked?: boolean;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

const levelColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Intermediate: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Advanced: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
};

interface StoriesGridProps {
  locale: string;
  stories: Story[];
}

export function StoriesGrid({ locale, stories }: StoriesGridProps) {
  const [activeFilter, setActiveFilter] = useState('All Levels');

  const filters = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredStories = activeFilter === 'All Levels'
    ? stories
    : stories.filter((story) => story.level === activeFilter);

  return (
    <>
      <div className="bg-[#0d1f38] border-b border-white/6 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookMarked className="w-6 h-6 text-blue-400" />
              Story Library
            </h1>
            <p className="text-slate-400 text-sm mt-1">Immersive Kurdish stories with audio. Learn naturally through context.</p>
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-sm font-medium px-3 py-2 rounded-xl transition-all ${activeFilter === f ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 bg-white/5 border border-white/8 hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Stories Read', value: '2', total: `${stories.length}`, icon: '📖', color: 'text-emerald-400' },
            { label: 'Words Encountered', value: '300', total: '', icon: '💬', color: 'text-blue-400' },
            { label: 'Audio Minutes', value: '12m', total: '', icon: '🎧', color: 'text-purple-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d1f38] border border-white/8 rounded-xl p-4 flex items-center gap-4">
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <div className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}{stat.total && <span className="text-slate-500 text-base font-normal">/{stat.total}</span>}
                </div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStories.map((story) => (
            <div key={story.id} className={`${story.bg} border ${story.border} rounded-2xl overflow-hidden group hover:scale-[1.01] transition-all ${story.locked ? 'opacity-70' : ''}`}>
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${story.color} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                    📖
                  </div>
                  <div className="flex items-center gap-2">
                    {story.completed && <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>}
                    {story.locked && <Lock className="w-4 h-4 text-slate-400" />}
                    {story.audioAvailable && <Headphones className="w-4 h-4 text-blue-400" />}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${levelColors[story.level]}`}>{story.level}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-medium">{story.category}</div>
                <h3 className="text-base font-bold text-white mb-0.5">{story.title}</h3>
                <p className="text-sm font-medium text-emerald-400 mb-2" dir="rtl">{story.titleKd}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{story.desc}</p>
              </div>

              <div className="px-5 py-3 border-t border-white/6 flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{story.duration}</div>
                <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{story.words} words</div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-amber-400 font-semibold">{story.rating}</span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-emerald-400 font-semibold">⚡ +{story.xp} XP</div>
              </div>

              <div className="px-5 py-4 bg-white/2 border-t border-white/4">
                <Link
                  href={story.locked ? '#' : `/${locale}/stories/${story.id}`}
                  className={`flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold rounded-xl transition-all ${story.locked ? 'bg-white/5 text-slate-500 cursor-not-allowed' : story.completed ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15' : `bg-gradient-to-r ${story.color} text-white shadow-lg hover:-translate-y-0.5`}`}
                >
                  {story.locked ? <><Lock className="w-3.5 h-3.5" /> Locked</> : story.completed ? <><Play className="w-3.5 h-3.5" /> Read Again</> : <><Play className="w-3.5 h-3.5" /> Read Story</>}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
