import { createProgram } from '@/lib/learning-paths';
import { createLearningProgramSchema } from '@/lib/validations/learning-paths';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { localePath } from '@/lib/locale';

export default async function NewProgramPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loginPath = localePath(locale, '/login');
  const dashboardPath = localePath(locale, '/dashboard');
  const basePath = localePath(locale, '/admin/learning-paths');

  const currentUser = await getCurrentUser();
  if (!currentUser?.id) redirect(loginPath);

  try {
    await requireMinRole('admin_super');
  } catch {
    redirect(dashboardPath);
  }

  /**
   * Server Action — bound inside the Server Component so it can close over
   * the locale-aware redirect paths without prop drilling.
   *
   * The explicit `(formData: FormData) => Promise<void>` cast is intentional:
   * `redirect()` returns `never`, which TypeScript does not automatically widen
   * to `void` in all inference contexts. Casting the function (not its return
   * value) keeps the signature fully type-safe while satisfying the HTMLFormElement
   * `action` prop type expected by Next.js 14+ Server Actions.
   */
  const createProgramAction = (async (formData: FormData) => {
    'use server';

    const actionUser = await getCurrentUser();
    if (!actionUser?.id) {
      redirect(loginPath);
    }

    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      programType: formData.get('programType') as
        | 'beginner'
        | 'intermediate'
        | 'advanced'
        | 'specialized',
      difficultyLevel: formData.get('difficultyLevel') as
        | 'beginner'
        | 'intermediate'
        | 'advanced'
        | undefined,
      status: 'draft' as const,
    };

    const validated = createLearningProgramSchema.parse(data);
    await createProgram(validated);
    redirect(basePath);
  }) satisfies (formData: FormData) => Promise<void>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <a href={basePath} className="text-blue-600 hover:underline">
          ← Back to Learning Paths
        </a>
        <h1 className="text-4xl font-bold mt-4">Create New Program</h1>
      </div>

      <form action={createProgramAction} className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Program Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Kurdish in 30 Days"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., kurdish-in-30-days"
            />
            <p className="text-sm text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the program..."
            />
          </div>

          <div>
            <label htmlFor="programType" className="block text-sm font-medium text-gray-700 mb-2">
              Program Type *
            </label>
            <select
              id="programType"
              name="programType"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select type...</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="specialized">Specialized</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              id="difficultyLevel"
              name="difficultyLevel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select difficulty...</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            <a
              href={basePath}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Program
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
