'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface AppSidebarProps {
  locale: string;
  activePage?: string;
}

const navItems = [
  { icon: '📊', label: 'Dashboard', href: '/dashboard', id: 'dashboard' },
  { icon: '📖', label: 'Learn', href: '/dashboard/learning', id: 'learning' },
  { icon: '🎓', label: 'Courses', href: '/courses', id: 'courses' },
  { icon: '🎯', label: 'Practice', href: '/srs', id: 'practice' },
  { icon: '👥', label: 'Community', href: '/community', id: 'community' },
  { icon: '🏆', label: 'Leaderboard', href: '/leaderboard', id: 'leaderboard' },
  { icon: '⭐', label: 'Achievements', href: '/achievements', id: 'achievements' },
];

export function AppSidebar({ locale, activePage }: AppSidebarProps) {
  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.aside
      className="w-60 bg-[#0d1f38] border-r border-white/6 flex flex-col min-h-screen sticky top-0 shrink-0"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Logo */}
      <motion.div
        className="p-5 border-b border-white/6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
          <motion.div
            className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BookOpen className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <div className="text-sm font-bold text-white">KURDAMUZ</div>
            <div className="text-xs text-emerald-400">کوردآموز</div>
          </div>
        </Link>
      </motion.div>

      {/* Navigation */}
      <motion.nav
        className="flex-1 p-3 space-y-0.5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <motion.div key={item.id} variants={itemVariants}>
              <Link
                href={`/${locale}${item.href}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-emerald-400 rounded-full"
                    layoutId="activeIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>
    </motion.aside>
  );
}
