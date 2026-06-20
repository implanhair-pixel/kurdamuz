'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface ParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  duration?: number;
  trigger?: boolean;
}

export function Particles({
  count = 20,
  color = '#10b981',
  size = 8,
  duration = 3,
  trigger = true,
}: ParticlesProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    duration: duration + Math.random() * 1,
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    angle: Math.random() * 360,
  }));

  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            boxShadow: `0 0 ${size}px ${color}`,
            left: '50%',
            top: '50%',
          }}
          initial={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
          }}
          animate={{
            opacity: 0,
            x: particle.x,
            y: particle.y,
            scale: 0,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// کامپوننت برای ذرات متحرک در پس‌زمینه
export function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
