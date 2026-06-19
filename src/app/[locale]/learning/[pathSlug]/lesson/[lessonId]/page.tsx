import { getLessonById } from '@/lib/curriculum/lessons';
import { getLessonProgressDetails, completeLesson } from '@/lib/learning-paths/progress';
import { getActivitiesByLessonId } from '@/lib/curriculum/activities';
import { getAssessmentsByLessonId } from '@/lib/curriculum/assessments';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { LearningActivity, LearningAssessment } from '@/types/learning-paths';

interface PageProps {
  params: Promise<{
    locale: string;
    pathSlug: string;
    lessonId: string;
  }>;
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { pathSlug, lessonId } = await params;
  const currentUser = await getCurrentUser();
  const userId = currentUser?.id;

  const lesson = await getLessonById(lessonId);

  if (!lesson) {
    redirect(`/learning/${pathSlug}`);
    return null;
  }

  const progress = userId ? await getLessonProgressDetails(userId, lesson.id) : null;
  const activities = await getActivitiesByLessonId(lesson.id);
  const assessments = await getAssessmentsByLessonId(lesson.id);

  async function handleCompleteLesson() {
    'use server';
    const actionUser = await getCurrentUser();
    if (!actionUser?.id) {
      redirect('/login');
    }

    const pathId = 'placeholder-path-id';

    if (lesson && actionUser) {
      await completeLesson(actionUser.id, pathId, 'placeholder-module-id', lesson.id, 0);
    }
    redirect(`/learning/${pathSlug}`);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-600">
        <a href="/learning-paths" className="hover:underline">
          Learning Paths
        </a>
        <span className="mx-2">/</span>
        <a href={`/learning/${pathSlug}`} className="hover:underline">
          {pathSlug}
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{lesson.title}</span>
      </nav>

      {/* Lesson Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full capitalize">
            {lesson.lessonType}
          </span>
          {lesson.estimatedDuration && (
            <span className="text-sm text-gray-500">
              {Math.round(lesson.estimatedDuration / 60)} min
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">{lesson.title}</h1>

        {progress && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {progress.progress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        )}

        {progress?.completionStatus !== 'completed' && userId && (
          <form action={handleCompleteLesson as any}>
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Mark as Complete
            </button>
          </form>
        )}

        {progress?.completionStatus === 'completed' && (
          <div className="flex items-center text-green-600">
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Lesson Completed</span>
          </div>
        )}
      </div>

      {/* Activities */}
      {activities.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Activities</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-sm font-medium bg-orange-100 text-orange-800 rounded-full capitalize">
                    {activity.activityType}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">Activity {(activity.sequenceOrder || 0) + 1}</h3>
                {activity.content && (
                  <div className="text-gray-600">
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(activity.content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Assessments */}
      {assessments.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Assessments</h2>
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full capitalize">
                    {assessment.assessmentType}
                  </span>
                  {assessment.passingScore && (
                    <span className="text-sm text-gray-500">
                      Passing Score: {assessment.passingScore}%
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">Assessment</h3>
                {assessment.content && (
                  <div className="text-gray-600">
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(assessment.content, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lesson Content Reference */}
      {lesson.contentReference && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">Related Content</h2>
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-gray-600">
              This lesson references content from the existing lessons system.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Reference ID: {lesson.contentReference}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
