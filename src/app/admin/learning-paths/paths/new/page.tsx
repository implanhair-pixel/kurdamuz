import { createPath } from '@/lib/learning-paths/paths';
import { getAllPrograms } from '@/lib/learning-paths/programs';
import { createLearningPathSchema } from '@/lib/validations/learning-paths';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewPathPage() {
  const user = await getCurrentUser();
  
  if (!user?.id) {
    redirect('/login');
  }

  const programs = await getAllPrograms();

  async function createPathAction(formData: FormData) {
    'use server';
    
    const user = await getCurrentUser();
    if (!user?.id) {
      redirect('/login');
    }

    const data = {
      programId: formData.get('programId') as string,
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      estimatedDuration: formData.get('estimatedDuration') ? parseInt(formData.get('estimatedDuration') as string) : undefined,
      difficultyLevel: formData.get('difficultyLevel') as 'beginner' | 'intermediate' | 'advanced' | undefined,
      active: true,
    };

    const validated = createLearningPathSchema.parse(data);
    await createPath(validated);
    redirect('/admin/learning-paths');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <a href="/admin/learning-paths" className="text-blue-600 hover:underline">
          ← Back to Learning Paths
        </a>
        <h1 className="text-4xl font-bold mt-4">Create New Learning Path</h1>
      </div>

      <form action={createPathAction as any} className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="space-y-6">
          <div>
            <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-2">
              Program *
            </label>
            <select
              id="programId"
              name="programId"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select program...</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Path Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Beginner Course"
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
              placeholder="e.g., beginner-course"
            />
            <p className="text-sm text-gray-500 mt-1">
              Only lowercase letters, numbers, and hyphens
            </p>
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
              placeholder="Describe the learning path..."
            />
          </div>

          <div>
            <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              id="estimatedDuration"
              name="estimatedDuration"
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 600"
            />
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
              href="/admin/learning-paths"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Path
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
