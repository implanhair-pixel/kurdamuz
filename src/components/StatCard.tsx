'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'orange';
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
}

const colorClasses = {
  emerald: {
    bg: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    icon: 'text-emerald-400',
  },
  amber: {
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    icon: 'text-amber-400',
  },
  blue: {
    bg: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    icon: 'text-blue-400',
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    icon: 'text-purple-400',
  },
  red: {
    bg: 'from-red-500/10 to-red-500/5',
    border: 'border-red-500/20',
    text: 'text-red-400',
    icon: 'text-red-400',
  },
  orange: {
    bg: 'from-orange-500/10 to-orange-500/5',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    icon: 'text-orange-400',
  },
};

export function StatCard({
  title,
  value,
  icon,
  color = 'emerald',
  subtitle,
  trend,
  trendValue,
  delay = 0,
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-${color}-500/20`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <motion.div
          className={`${colors.icon} opacity-50`}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
      </div>

      {trend && (
        <div className={`flex items-center gap-1 text-xs ${
          trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
        }`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </div>
      )}
    </motion.div>
  );
}
