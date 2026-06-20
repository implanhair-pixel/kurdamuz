'use client';

import { useState } from 'react';
import {
  Confetti,
  AchievementUnlock,
  useAchievementUnlock,
  AnimatedButton,
  Flame,
  FlameGroup,
  XPPopup,
  useXPPopups,
  PageWrapper,
  Particles,
} from '@/components/effects';
import { Award, Zap, TrendingUp } from 'lucide-react';

/**
 * این مثال نشان می‌دهد چگونه تمام افکت‌های بصری را در یک صفحه داشبورد استفاده کنید
 * 
 * برای استفاده:
 * 1. این کامپوننت را در صفحه داشبورد خود import کنید
 * 2. تمام state و handlers را در صفحه خود استفاده کنید
 */

export default function DashboardWithEffects() {
  const { achievements, showAchievement, removeAchievement } = useAchievementUnlock();
  const { popups, addPopup, removePopup } = useXPPopups();
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(12);
  const [level, setLevel] = useState(5);

  // Handler برای اتمام درس
  const handleCompleteLesson = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top;

    // نمایش XP Popup
    addPopup(100, centerX, centerY);

    // نمایش Confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
  };

  // Handler برای دستاورد
  const handleUnlockAchievement = () => {
    setShowConfetti(true);
    showAchievement({
      title: 'Lesson Master',
      description: 'Complete 10 lessons in a row',
      icon: '🎓',
      xp: 250,
      coins: 50,
      autoClose: 5000,
    });
  };

  // Handler برای بالا رفتن سطح
  const handleLevelUp = () => {
    setLevel(level + 1);
    setShowConfetti(true);
    showAchievement({
      title: 'Level Up!',
      description: `You reached level ${level + 1}`,
      icon: '⭐',
      xp: 500,
      coins: 100,
      autoClose: 5000,
    });
  };

  return (
    <PageWrapper direction="right">
      <div className="min-h-screen bg-[#0a1628] p-8">
        {/* Confetti Effect */}
        <Confetti trigger={showConfetti} type="celebration" />

        {/* XP Popups */}
        {popups.map((popup) => (
          <XPPopup
            key={popup.id}
            amount={popup.amount}
            x={popup.x}
            y={popup.y}
            onComplete={() => removePopup(popup.id)}
          />
        ))}

        {/* Achievement Unlocks */}
        {achievements.map((achievement) => (
          <AchievementUnlock
            key={achievement.id}
            {...achievement}
            onClose={() => removeAchievement(achievement.id)}
          />
        ))}

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here are your visual effects in action.</p>
        </div>

        {/* Stats Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Level Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Current Level</p>
                <p className="text-4xl font-bold text-white">{level}</p>
              </div>
              <Award className="w-12 h-12 text-emerald-400" />
            </div>
            <AnimatedButton
              onClick={handleLevelUp}
              variant="success"
              size="sm"
              className="w-full mt-4"
            >
              Level Up
            </AnimatedButton>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Current Streak</p>
                <p className="text-4xl font-bold text-white">{streak}</p>
              </div>
              <FlameGroup count={3} intensity="high" />
            </div>
          </div>

          {/* XP Card */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Weekly XP</p>
                <p className="text-4xl font-bold text-white">850</p>
              </div>
              <Zap className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">Try Effects</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Complete Lesson Button */}
            <AnimatedButton
              onClick={handleCompleteLesson}
              variant="primary"
              size="lg"
              className="w-full"
            >
              <TrendingUp className="w-5 h-5" />
              Complete Lesson (+100 XP)
            </AnimatedButton>

            {/* Unlock Achievement Button */}
            <AnimatedButton
              onClick={handleUnlockAchievement}
              variant="success"
              size="lg"
              className="w-full"
            >
              <Award className="w-5 h-5" />
              Unlock Achievement
            </AnimatedButton>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            💡 <strong>Tip:</strong> Click the buttons above to see the visual effects in action!
            Each button triggers different animations and effects.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
