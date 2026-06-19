'use client';

import { useTranslations } from 'next-intl';

interface RecommendationCardProps {
  recommendedLevel: string;
  onContinue: () => void;
  onRetake: () => void;
}

export function RecommendationCard({ recommendedLevel, onContinue, onRetake }: RecommendationCardProps) {
  const t = useTranslations('placement');

  const getRecommendationText = (level: string) => {
    switch (level) {
      case 'advanced':
        return 'You have demonstrated advanced language skills. You are ready for advanced courses and challenging content.';
      case 'intermediate':
        return 'You have a good foundation in the language. You are ready for intermediate courses to further develop your skills.';
      case 'beginner':
      default:
        return 'You are at the beginning of your language learning journey. Start with beginner courses to build a strong foundation.';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'advanced':
        return 'border-green-500 bg-green-50';
      case 'intermediate':
        return 'border-yellow-500 bg-yellow-50';
      case 'beginner':
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className={`border-l-4 p-4 sm:p-6 rounded-lg ${getLevelColor(recommendedLevel)}`}>
      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
        {t('messages.recommendedLevel')}: {t('proficiency.' + recommendedLevel as any)}
      </h3>
      <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">{getRecommendationText(recommendedLevel)}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={onContinue}
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-center"
        >
          Continue Learning
        </button>
        <button
          onClick={onRetake}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-center"
        >
          {t('messages.retakeTest')}
        </button>
      </div>
    </div>
  );
}
