import type { LearningRecommendation } from '@/types/learning-paths';

interface RecommendationCardProps {
  recommendation: LearningRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
          {recommendation.recommendationType}
        </span>
        {recommendation.confidenceScore && (
          <span className="text-sm text-gray-500">
            {Math.round(parseFloat(recommendation.confidenceScore) * 100)}% match
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold mb-2">Recommendation</h3>
      {recommendation.recommendationData && (
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(recommendation.recommendationData, null, 2)}
        </pre>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-blue-600 hover:underline font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}
