'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { Confetti } from './Confetti';
import { Particles } from './Particles';

interface AchievementUnlockProps {
  title: string;
  description: string;
  icon: string;
  xp: number;
  coins: number;
  onClose?: () => void;
  autoClose?: number;
}

export function AchievementUnlock({
  title,
  description,
  icon,
  xp,
  coins,
  onClose,
  autoClose = 5000,
}: AchievementUnlockProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
  }, []);

  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  return (
    <>
      <Confetti trigger={showConfetti} type="achievement" />
      <Particles trigger={showConfetti} count={30} color="#fbbf24" />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 max-w-md w-full border border-amber-500/30 shadow-2xl"
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 50 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Close Button */}
              <motion.button
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-slate-400" />
              </motion.button>

              {/* Header */}
              <motion.div
                className="text-center mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="inline-block mb-4"
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Trophy className="w-16 h-16 text-amber-400 drop-shadow-lg" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Achievement Unlocked!</h2>
              </motion.div>

              {/* Content */}
              <motion.div
                className="text-center mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-6xl mb-4">{icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-300 text-sm">{description}</p>
              </motion.div>

              {/* Rewards */}
              <motion.div
                className="grid grid-cols-2 gap-4 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 text-center">
                  <p className="text-emerald-400 text-sm font-semibold">XP Earned</p>
                  <p className="text-2xl font-bold text-white">+{xp}</p>
                </div>
                <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 text-center">
                  <p className="text-amber-400 text-sm font-semibold">Coins</p>
                  <p className="text-2xl font-bold text-white">+{coins}</p>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg transition-all"
                onClick={() => setIsOpen(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Awesome! 🎉
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Hook برای مدیریت چندین Achievement Unlock
export function useAchievementUnlock() {
  const [achievements, setAchievements] = useState<
    Array<AchievementUnlockProps & { id: string }>
  >([]);

  const showAchievement = (achievement: AchievementUnlockProps) => {
    const id = Math.random().toString();
    setAchievements((prev) => [...prev, { ...achievement, id }]);
  };

  const removeAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  return { achievements, showAchievement, removeAchievement };
}
