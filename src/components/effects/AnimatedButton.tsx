'use client';

import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  showParticles?: boolean;
}

const variantClasses = {
  primary: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-800 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  showParticles = false,
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg font-semibold
        transition-all duration-200
        relative overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Ripple Effect */}
      <motion.div
        className="absolute inset-0 bg-white/20 rounded-lg"
        initial={{ scale: 0, opacity: 1 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.6 }}
        style={{ pointerEvents: 'none' }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

// Button variant برای دکمه‌های دستاوردها
export function AchievementButton({
  children,
  onClick,
  unlocked = false,
}: {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  unlocked?: boolean;
}) {
  return (
    <motion.button
      className={`
        px-4 py-2 rounded-lg font-semibold
        ${
          unlocked
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
            : 'bg-slate-700 text-slate-400'
        }
        transition-all duration-200
      `}
      onClick={onClick}
      disabled={!unlocked}
      whileHover={unlocked ? { scale: 1.05, boxShadow: '0 0 20px rgba(251, 146, 60, 0.5)' } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}
    >
      <motion.span
        animate={unlocked ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
