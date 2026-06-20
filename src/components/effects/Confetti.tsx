'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger?: boolean;
  type?: 'celebration' | 'achievement' | 'level-up' | 'streak';
  particleCount?: number;
}

export function Confetti({ trigger = false, type = 'celebration', particleCount = 100 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const confettiInstance = confetti.create(canvas, { resize: true, useWorker: true });

    // تنظیمات مختلف برای هر نوع انفجار
    const configs = {
      celebration: {
        particleCount,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
      },
      achievement: {
        particleCount: particleCount * 1.5,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#fcd34d', '#fef3c7'],
        shapes: ['star'] as any,
      },
      'level-up': {
        particleCount: particleCount * 2,
        spread: 360,
        origin: { y: 0.5 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
        gravity: 0.5,
      },
      streak: {
        particleCount: particleCount * 1.2,
        spread: 80,
        origin: { y: 0.4 },
        colors: ['#ff6b6b', '#ff8787', '#ffa8a8'],
        ticks: 200,
      },
    };

    const config = configs[type] || configs.celebration;

    // انفجار اول
    confettiInstance(config);

    // انفجار دوم (تاخیر)
    setTimeout(() => {
      confettiInstance({
        ...config,
        particleCount: Math.floor(config.particleCount / 2),
      });
    }, 300);

    return () => {
      confettiInstance.reset();
    };
  }, [trigger, type, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
