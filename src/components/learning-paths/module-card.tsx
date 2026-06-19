import type { LearningModule } from '@/types/learning-paths';
import Link from 'next/link';

interface ModuleCardProps {
  module: LearningModule;
  pathSlug: string;
  index: number;
  isUnlocked?: boolean;
  progress?: number;
}

export function ModuleCard({ module, pathSlug, index, isUnlocked = true, progress = 0 }: ModuleCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 border ${
        isUnlocked ? 'border-gray-200' : 'border-gray-300 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-4">
            {index + 1}
          </div>
          <div>
            <h3 className="text-xl font-bold">{module.title}</h3>
            {module.description && (
              <p className="text-gray-600 text-sm">{module.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {module.estimatedDuration && (
            <span className="text-sm text-gray-500">
              {Math.round(module.estimatedDuration / 60)}h
            </span>
          )}
          {isUnlocked && (
            <Link
              href={`/learning/${pathSlug}/module/${module.id}`}
              className="text-blue-600 hover:underline font-medium"
            >
              {progress > 0 ? 'Continue' : 'Start'}
            </Link>
          )}
          {!isUnlocked && (
            <span className="text-gray-400 text-sm">Locked</span>
          )}
        </div>
      </div>

      {progress > 0 && (
        <div className="ml-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
