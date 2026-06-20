import { getPathBySlug } from '@/lib/learning-paths';
import { getLearningPathHierarchy } from '@/lib/curriculum';
import { getUserPathProgress } from '@/lib/learning-paths/progress';
import { isUserEnrolledInPath, enrollUserInPath } from '@/lib/learning-paths/enrollment';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { localePath } from '@/lib/locale';

interface PageProps {
  params: Promise<{
    locale: string;
    pathSlug: string;
  }>;
}

export default async function LearningPathDetailPage({ params }: PageProps) {
  const { locale, pathSlug } = await params;
  const user = await getCurrentUser();
  const userId = user?.id;
  const loginPath = localePath(locale, '/login');
  const pathsIndex = localePath(locale, '/learning-paths');
  const pathPage = localePath(locale, `/learning/${pathSlug}`);

  const path = await getPathBySlug(pathSlug);

  if (!path) {
    redirect(pathsIndex);
    return null;
  }

  const hierarchy = await getLearningPathHierarchy(path.id);
  const isEnrolled = userId ? await isUserEnrolledInPath(userId, path.id) : false;
  const userProgress = userId ? await getUserPathProgress(userId, path.id) : [];

  async function handleEnroll() {
    'use server';
    const actionUser = await getCurrentUser();
    if (!actionUser?.id) {
      redirect(loginPath);
    }
    await enrollUserInPath(actionUser.id, path.id);
    redirect(pathPage);
  }

  const overallProgress =
    userProgress.length > 0
      ? userProgress.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / userProgress.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-600">
        <a href={pathsIndex} className="hover:underline">
          Learning Paths
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{path.name}</span>
      </nav>

      <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          {path.difficultyLevel && (
            <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full capitalize">
              {path.difficultyLevel}
            </span>
          )}
          {path.estimatedDuration && (
            <span className="text-sm text-gray-500">
              {Math.round(path.estimatedDuration / 60)} hours
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4">{path.name}</h1>
        <p className="text-gray-600 mb-6">{path.description}</p>

        {userId && !isEnrolled && (
          <form action={handleEnroll as any}>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Enroll in this Path
            </button>
          </form>
        )}

        {isEnrolled && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Your Progress</span>
              <span className="text-sm font-medium text-gray-700">
                {overallProgress.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {hierarchy && hierarchy.modules.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Modules</h2>
          <div className="space-y-4">
            {hierarchy.modules.map((module, moduleIndex) => {
              const moduleProgress = userProgress.find((p) => p.moduleId === module.id);
              const moduleProgressPercent = moduleProgress?.progressPercentage || 0;
              const isModuleUnlocked =
                moduleIndex === 0 ||
                userProgress.some(
                  (p) => p.moduleId === hierarchy.modules[moduleIndex - 1].id && p.completionStatus === 'completed'
                );
              const firstLesson = module.units.flatMap((unit) => unit.lessons)[0];
              const lessonHref = firstLesson ? localePath(locale, `/learning/${pathSlug}/lesson/${firstLesson.id}`) : null;

              return (
                <div
                  key={module.id}
                  className={`bg-white rounded-lg shadow-md p-6 border ${
                    isModuleUnlocked ? 'border-gray-200' : 'border-gray-300 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-4">
                        {moduleIndex + 1}
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
                      {isModuleUnlocked && lessonHref && (
                        <a
                          href={lessonHref}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {moduleProgressPercent > 0 ? 'Continue' : 'Start'}
                        </a>
                      )}
                      {isModuleUnlocked && !lessonHref && (
                        <span className="text-gray-400 text-sm">No lessons yet</span>
                      )}
                      {!isModuleUnlocked && (
                        <span className="text-gray-400 text-sm">Locked</span>
                      )}
                    </div>
                  </div>

                  {moduleProgressPercent > 0 && (
                    <div className="ml-12">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-700">
                          {moduleProgressPercent.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${moduleProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {module.units.length > 0 && isModuleUnlocked && (
                    <div className="ml-12 mt-4 space-y-2">
                      {module.units.map((unit) => (
                        <div key={unit.id} className="pl-4 border-l-2 border-gray-200">
                          <h4 className="font-medium text-gray-700">{unit.title}</h4>
                          {unit.lessons.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {unit.lessons.map((lesson) => {
                                const lessonProgress = userProgress.find((p) => p.lessonId === lesson.id);
                                const isCompleted = lessonProgress?.completionStatus === 'completed';
                                const isInProgress = lessonProgress?.completionStatus === 'in_progress';

                                return (
                                  <a
                                    key={lesson.id}
                                    href={localePath(locale, `/learning/${pathSlug}/lesson/${lesson.id}`)}
                                    className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                                  >
                                    {isCompleted && '✓ '}
                                    {isInProgress && '◷ '}
                                    {lesson.title}
                                  </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
