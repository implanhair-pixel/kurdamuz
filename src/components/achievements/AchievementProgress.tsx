import { TrendingUp, Target, Clock } from 'lucide-react';
import type { AchievementProgress } from '@/types/achievement';

interface AchievementProgressProps {
  progress: AchievementProgress;
}

export function AchievementProgress({ progress }: AchievementProgressProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Achievement Progress</h3>

      <div className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-blue-600">
              {progress.percentageComplete}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${progress.percentageComplete}%` }}
            />
          </div>
        </div>

        {/* Current Progress */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Current</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {progress.currentProgress}
            </p>
            <p className="text-xs text-gray-600">of {progress.targetProgress}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Remaining</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {progress.targetProgress - progress.currentProgress}
            </p>
            <p className="text-xs text-gray-600">to complete</p>
          </div>
        </div>

        {/* Estimated Completion */}
        {progress.estimatedCompletion && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Estimated Completion</span>
            </div>
            <p className="text-lg font-semibold text-yellow-700">
              {new Date(progress.estimatedCompletion).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Milestones */}
        {progress.milestones.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Milestones</h4>
            <div className="space-y-2">
              {progress.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    milestone.achieved 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.achieved ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {milestone.achieved ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{milestone.title}</p>
                    <p className="text-xs text-gray-600">{milestone.description}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {milestone.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
