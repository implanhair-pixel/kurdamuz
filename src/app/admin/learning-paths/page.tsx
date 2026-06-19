import { getAllPrograms, getAllPaths } from '@/lib/learning-paths';
import { getModulesByPathId } from '@/lib/curriculum';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLearningPathsPage() {
  const user = await getCurrentUser();
  
  if (!user?.id) {
    redirect('/login');
  }

  // TODO: Add proper admin role check
  // const isAdmin = await checkAdminRole(session.user.id);
  // if (!isAdmin) {
  //   redirect('/dashboard');
  // }

  const programs = await getAllPrograms();
  const paths = await getAllPaths();

  // Enrich paths with module counts
  const enrichedPaths = await Promise.all(
    paths.map(async (path) => {
      const modules = await getModulesByPathId(path.id);
      return {
        ...path,
        moduleCount: modules.length,
      };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Learning Paths Management</h1>
        <a
          href="/admin/learning-paths/programs/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Create Program
        </a>
      </div>

      {/* Programs Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Programs</h2>
        {programs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
            <p className="text-gray-500 mb-4">No programs created yet.</p>
            <a
              href="/admin/learning-paths/programs/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create First Program
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Difficulty</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {programs.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{program.name}</td>
                    <td className="px-6 py-4 capitalize">{program.programType}</td>
                    <td className="px-6 py-4 capitalize">{program.difficultyLevel || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        program.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : program.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <a
                          href={`/admin/learning-paths/programs/${program.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </a>
                        <a
                          href={`/admin/learning-paths/programs/${program.id}/paths`}
                          className="text-blue-600 hover:underline"
                        >
                          Paths
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Paths Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Learning Paths</h2>
        {enrichedPaths.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
            <p className="text-gray-500 mb-4">No learning paths created yet.</p>
            <a
              href="/admin/learning-paths/paths/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create First Path
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Slug</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Difficulty</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Modules</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrichedPaths.map((path) => (
                  <tr key={path.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{path.name}</td>
                    <td className="px-6 py-4 text-gray-500">{path.slug}</td>
                    <td className="px-6 py-4 capitalize">{path.difficultyLevel || '-'}</td>
                    <td className="px-6 py-4">{path.moduleCount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        path.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {path.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <a
                          href={`/admin/learning-paths/paths/${path.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          Edit
                        </a>
                        <a
                          href={`/admin/learning-paths/paths/${path.id}/modules`}
                          className="text-blue-600 hover:underline"
                        >
                          Modules
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
