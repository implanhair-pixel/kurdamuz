'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

interface XPPopupProps {
  amount: number;
  x: number;
  y: number;
  onComplete?: () => void;
}

export function XPPopup({ amount, x, y, onComplete }: XPPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed pointer-events-none z-40"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, scale: 1, y: 0 }}
      animate={{ opacity: 0, scale: 1.5, y: -100 }}
      transition={{ duration: 2, ease: 'easeOut' }}
      onAnimationComplete={() => setIsVisible(false)}
    >
      <div className="flex items-center gap-1 text-2xl font-bold text-emerald-400 drop-shadow-lg">
        <Zap className="w-6 h-6" />
        +{amount}
      </div>
    </motion.div>
  );
}

// Hook برای مدیریت چندین XP Popup
export function useXPPopups() {
  const [popups, setPopups] = useState<Array<{ id: string; amount: number; x: number; y: number }>>([]);

  const addPopup = (amount: number, x: number, y: number) => {
    const id = Math.random().toString();
    setPopups((prev) => [...prev, { id, amount, x, y }]);
  };

  const removePopup = (id: string) => {
    setPopups((prev) => prev.filter((p) => p.id !== id));
  };

  return { popups, addPopup, removePopup };
}
