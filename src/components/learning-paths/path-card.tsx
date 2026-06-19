import type { LearningPath } from '@/types/learning-paths';
import Link from 'next/link';

interface PathCardProps {
  path: LearningPath & { moduleCount?: number };
}

export function PathCard({ path }: PathCardProps) {
  return (
    <Link
      href={`/learning/${path.slug}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        {path.difficultyLevel && (
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full capitalize">
            {path.difficultyLevel}
          </span>
        )}
        {path.moduleCount !== undefined && (
          <span className="text-sm text-gray-500">
            {path.moduleCount} modules
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2">{path.name}</h3>
      <p className="text-gray-600 mb-4">{path.description}</p>
      {path.estimatedDuration && (
        <div className="flex items-center text-sm text-gray-500">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {Math.round(path.estimatedDuration / 60)} hours
        </div>
      )}
    </Link>
  );
}
