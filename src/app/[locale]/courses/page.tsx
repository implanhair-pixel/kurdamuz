'use client';

import Link from 'next/link';
import { BookOpen, Play, Clock, Star, Zap, Users, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

const levelColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Intermediate: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Advanced: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
};

function getLevelLabel(level: string, t: (key: string) => string) {
  if (level === 'Beginner') return t('levels.Beginner');
  if (level === 'Intermediate') return t('levels.Intermediate');
  if (level === 'Advanced') return t('levels.Advanced');
  return level;
}

const mockCourses = [
  {
    id: 1,
    title: 'Kurdish Alphabet Mastery',
    subtitle: 'Foundation',
    desc: 'Learn all Kurdish letters, pronunciation rules, and basic writing system.',
    lessons: 24,
    duration: '4h 30m',
    xp: 480,
    level: 'Beginner',
    progress: 75,
    icon: '✕',
    color: 'from-emerald-600 to-teal-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    students: 4280,
    rating: 4.9,
  },
  {
    id: 2,
    title: 'Essential Vocabulary',
    subtitle: 'Core Words',
    desc: 'Build your core vocabulary with 500+ essential Kurdish words and phrases.',
    lessons: 36,
    duration: '6h 15m',
    xp: 720,
    level: 'Beginner',
    progress: 60,
    icon: '📖',
    color: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    students: 3150,
    rating: 4.8,
  },
  {
    id: 3,
    title: 'Real Conversations',
    subtitle: 'Speaking',
    desc: 'Practice real-life conversations with contextual learning and native audio.',
    lessons: 48,
    duration: '8h 00m',
    xp: 960,
    level: 'Intermediate',
    progress: 45,
    icon: '💬',
    color: 'from-purple-600 to-violet-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    students: 2890,
    rating: 4.7,
  },
  {
    id: 4,
    title: 'Grammar Builder',
    subtitle: 'Grammar',
    desc: 'Master Kurdish grammar structure, verb conjugations, and sentence patterns.',
    lessons: 42,
    duration: '7h 45m',
    xp: 840,
    level: 'Intermediate',
    progress: 30,
    icon: '⌨️',
    color: 'from-orange-600 to-red-600',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    students: 1950,
    rating: 4.9,
  },
  {
    id: 5,
    title: 'Listening Challenges',
    subtitle: 'Listening',
    desc: 'Improve comprehension with authentic Kurdish audio at varied speeds and accents.',
    lessons: 30,
    duration: '5h 20m',
    xp: 600,
    level: 'Intermediate',
    progress: 20,
    icon: '🎧',
    color: 'from-pink-600 to-rose-600',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    students: 1420,
    rating: 4.6,
  },
  {
    id: 6,
    title: 'Advanced Kurdish',
    subtitle: 'Advanced',
    desc: 'Complex grammar, idiomatic expressions, and fluency practice for advanced learners.',
    lessons: 60,
    duration: '12h 00m',
    xp: 1200,
    level: 'Advanced',
    progress: 0,
    icon: '🏆',
    color: 'from-amber-600 to-yellow-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    students: 890,
    rating: 4.9,
    locked: true,
  },
];

export default function CoursesPage() {
  const t = useTranslations('courses');
  const routeParams = useParams();
  const locale = (routeParams?.locale as string) || 'en';
  const router = useRouter();
  const [courses, setCourses] = useState(mockCourses);
  const [loading, setLoading] = useState(true);
  const [courseStatus, setCourseStatus] = useState<Record<string, { enrolled: boolean; pending: boolean }>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/public/courses');
        const data = await response.json();
        if (data.courses && data.courses.length > 0) {
          setCourses(data.courses);
        }

        const statusResponse = await fetch('/api/courses/status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          const nextStatus: Record<string, { enrolled: boolean; pending: boolean }> = {};
          for (const id of statusData.enrolledCourseIds || []) nextStatus[String(id)] = { enrolled: true, pending: false };
          for (const id of statusData.pendingPurchaseCourseIds || []) nextStatus[String(id)] = { enrolled: false, pending: true };
          for (const id of statusData.approvedPurchaseCourseIds || []) nextStatus[String(id)] = { enrolled: true, pending: false };
          setCourseStatus(nextStatus);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);


  const handleCourseAction = async (course: any) => {
    setActionError(null);
    try {
      const price = Number(course.price || 0);
      const status = courseStatus[String(course.id)] || { enrolled: false, pending: false };

      if (status.enrolled) return;

      const endpoint = price > 0 ? `/api/courses/${course.id}/purchase-request` : `/api/courses/${course.id}/enroll`;
      const response = await fetch(endpoint, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/${locale}/login`);
          return;
        }
        throw new Error(data.error || 'Request failed');
      }

      setCourseStatus((current) => ({
        ...current,
        [String(course.id)]: {
          enrolled: price === 0 || Boolean(data.approved),
          pending: price > 0 && !data.approved,
        },
      }));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unknown error');
    }
  };
  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <div className="bg-[#0d1f38] border-b border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/${locale}`} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">KURDAMUZ</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`} className="text-sm text-slate-400 hover:text-white transition-colors">{t('home')}</Link>
            <Link href={`/${locale}/courses`} className="text-sm text-emerald-400 font-semibold">{t('courses')}</Link>
            <Link href={`/${locale}/dashboard`} className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl">{t('dashboard')}</Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5 text-sm text-emerald-400 font-medium">
            <BookOpen className="w-3.5 h-3.5" />
            {t('badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">{t('title2')}</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            {t('subtitle')}
          </p>
          {actionError && (
            <p className="mt-4 text-sm text-rose-300">{actionError}</p>
          )}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div
              key={course.id}
              className={`group relative rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-pointer ${course.bg} ${course.border}`}
            >
              {course.locked && (
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center z-10">
                  <Lock className="w-8 h-8 text-white" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{course.icon}</div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${levelColors[course.level]}`}>
                    {getLevelLabel(course.level, t)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{course.title}</h3>
                <p className="text-sm text-slate-400 mb-4">{course.desc}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">{course.lessons} {t('lessons')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">{course.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">{course.students.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress or Rating */}
                {course.progress !== undefined ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Progress</span>
                      <span className="text-xs font-semibold text-emerald-400">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
                      />
                    ))}
                    <span className="text-xs text-slate-400 ml-1">{course.rating}</span>
                  </div>
                )}

                {/* Button */}
                {(() => {
                  const status = courseStatus[String(course.id)] || { enrolled: false, pending: false };
                  const price = Number(course.price || 0);
                  const isLocked = Boolean(course.locked);
                  const disabled = isLocked || status.enrolled || status.pending;
                  const label = isLocked
                    ? 'Locked'
                    : status.enrolled
                      ? 'Enrolled'
                      : status.pending
                        ? 'Request pending'
                        : price > 0
                          ? 'Request access'
                          : 'Enroll for free';

                  return (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && handleCourseAction(course)}
                      className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        disabled
                          ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 group-hover:-translate-y-0.5'
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {label}
                    </button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
