'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AppHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  delay?: number;
}

export function AppHeader({
  title,
  description,
  icon,
  actions,
  delay = 0,
}: AppHeaderProps) {
  return (
    <motion.div
      className="bg-[#0d1f38] border-b border-white/6 px-8 py-5 sticky top-0 z-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.1 }}
        >
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {icon}
            {title}
          </h1>
          {description && (
            <p className="text-slate-400 text-sm mt-1">{description}</p>
          )}
        </motion.div>
        {actions && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1 }}
          >
            {actions}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
