'use client';

import { useTranslations } from 'next-intl';

interface ResultSummaryProps {
  overallScore: number;
  recommendedLevel: string;
  domainScores: {
    domain: string;
    score: number;
  }[];
}

export function ResultSummary({ overallScore, recommendedLevel, domainScores }: ResultSummaryProps) {
  const t = useTranslations('placement');

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'advanced':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'beginner':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">{t('results')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg">
          <div className="text-4xl sm:text-5xl font-bold mb-2">{overallScore.toFixed(1)}%</div>
          <div className="text-gray-600 text-sm sm:text-base">{t('messages.overallScore')}</div>
        </div>
        
        <div className="text-center p-4 sm:p-6 bg-gray-50 rounded-lg">
          <div className={`inline-block px-3 sm:px-4 py-2 rounded-full text-base sm:text-lg font-semibold mb-2 ${getLevelColor(recommendedLevel)}`}>
            {t('proficiency.' + recommendedLevel as any)}
          </div>
          <div className="text-gray-600 text-sm sm:text-base">{t('messages.recommendedLevel')}</div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('messages.domainScores')}</h3>
        {domainScores.map((domain) => (
          <div key={domain.domain} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
            <span className="font-medium capitalize text-sm sm:text-base">{t('skillDomains.' + domain.domain as any)}</span>
            <span className={`font-bold text-sm sm:text-base ${getScoreColor(domain.score)}`}>
              {domain.score.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
