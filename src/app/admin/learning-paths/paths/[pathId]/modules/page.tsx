import { getPathById } from '@/lib/learning-paths/paths';
import { getModulesByPathId, createModule } from '@/lib/curriculum/modules';
import { createLearningModuleSchema } from '@/lib/validations/learning-paths';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { localePath, normalizeLocale } from '@/lib/locale';

interface PageProps {
  params: {
    pathId: string;
  };
}

function getRequestLocale() {
  return normalizeLocale(headers().get('x-next-intl-locale'), 'en');
}

export default async function PathModulesPage({ params }: PageProps) {
  const locale = getRequestLocale();
  const loginPath = localePath(locale, '/login');
  const dashboardPath = localePath(locale, '/dashboard');
  const basePath = localePath(locale, '/admin/learning-paths');
  const modulesPage = localePath(locale, `/admin/learning-paths/paths/${params.pathId}/modules`);

  const user = await getCurrentUser();
  if (!user?.id) redirect(loginPath);

  try {
    await requireMinRole('admin_super');
  } catch {
    redirect(dashboardPath);
  }

  const path = await getPathById(params.pathId);
  if (!path) redirect(basePath);

  const modules = await getModulesByPathId(params.pathId);

  async function createModuleAction(formData: FormData) {
    'use server';

    const actionUser = await getCurrentUser();
    if (!actionUser?.id) {
      redirect(loginPath);
    }

    const data = {
      pathId: params.pathId,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      estimatedDuration: formData.get('estimatedDuration') ? parseInt(formData.get('estimatedDuration') as string) : undefined,
      sequenceOrder: modules.length,
    };

    const validated = createLearningModuleSchema.parse(data);
    await createModule(validated);
    redirect(modulesPage);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <a href={basePath} className="text-blue-600 hover:underline">
          ← Back to Learning Paths
        </a>
        <h1 className="text-4xl font-bold mt-4">Modules: {path.name}</h1>
        <p className="text-gray-600 mt-2">{path.description}</p>
      </div>

      <div className="mb-8">
        <form action={createModuleAction as any} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Add New Module</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Module Title *
              </label>
              <input type="text" id="title" name="title" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., Module 1: Basics" />
            </div>

            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input type="number" id="estimatedDuration" name="estimatedDuration" min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="e.g., 120" />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea id="description" name="description" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe the module..." />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Add Module
              </button>
            </div>
          </div>
        </form>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Existing Modules</h2>
        {modules.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
            <p className="text-gray-500">No modules created yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={module.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold mr-4">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{module.title}</h3>
                      {module.description && <p className="text-gray-600 text-sm">{module.description}</p>}
                    </div>
                  </div>
                  {module.estimatedDuration && (
                    <span className="text-sm text-gray-500">{Math.round(module.estimatedDuration / 60)}h</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
