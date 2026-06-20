'use client';

import { motion } from 'framer-motion';

interface FlameProps {
  size?: 'sm' | 'md' | 'lg';
  intensity?: 'low' | 'medium' | 'high';
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const intensityMap = {
  low: { duration: 0.8, scale: [1, 1.1, 0.9, 1] },
  medium: { duration: 0.6, scale: [1, 1.2, 0.95, 1] },
  high: { duration: 0.4, scale: [1, 1.3, 0.9, 1] },
};

export function Flame({ size = 'md', intensity = 'medium' }: FlameProps) {
  const config = intensityMap[intensity];

  return (
    <motion.div
      className={`${sizeMap[size]} text-orange-500 drop-shadow-lg`}
      animate={{
        scale: config.scale,
        filter: ['drop-shadow(0 0 2px #ff6b35)', 'drop-shadow(0 0 8px #ff6b35)', 'drop-shadow(0 0 2px #ff6b35)'],
      }}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2c-1 2-2 4-2 6 0 3.314 1.791 6 4 6 2.209 0 4-2.686 4-6 0-2-1-4-2-6-2 2-3 4-4 6zm0 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
      </svg>
    </motion.div>
  );
}

// کامپوننت برای نمایش چندین شعله
export function FlameGroup({ count = 3, intensity = 'high' }: { count?: number; intensity?: 'low' | 'medium' | 'high' }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Flame size="sm" intensity={intensity} />
        </motion.div>
      ))}
    </div>
  );
}
