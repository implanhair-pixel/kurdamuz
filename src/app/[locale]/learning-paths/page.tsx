import { getAllPrograms, getAllPaths } from '@/lib/learning-paths';
import { getModulesByPathId } from '@/lib/curriculum';
type Metadata = { title?: string; description?: string; [key: string]: unknown };

export const metadata: Metadata = {
  title: 'Learning Paths',
  description: 'Explore our structured learning paths for Kurdish language mastery',
};

export default async function LearningPathsPage() {
  let programs: any[] = [];
  let paths: any[] = [];
  let enrichedPaths: any[] = [];

  try {
    programs = await getAllPrograms({ status: 'active' });
  } catch {
    // Database not yet set up
  }

  try {
    paths = await getAllPaths({ active: true });
  } catch {
    // Database not yet set up
  }

  // Enrich paths with module counts
  try {
    enrichedPaths = await Promise.all(
      paths.map(async (path) => {
        const modules = await getModulesByPathId(path.id);
        return {
          ...path,
          moduleCount: modules.length,
          totalDuration: modules.reduce((sum, m) => sum + (m.estimatedDuration || 0), 0),
        };
      })
    );
  } catch {
    enrichedPaths = paths;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Learning Paths</h1>
        <p className="text-gray-600">
          Structured courses designed to take you from beginner to advanced
        </p>
      </div>

      {/* Programs Section */}
      {programs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {program.programType}
                  </span>
                  {program.difficultyLevel && (
                    <span className="text-sm text-gray-500 capitalize">
                      {program.difficultyLevel}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2">{program.name}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Paths Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Available Paths</h2>
        {enrichedPaths.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No learning paths available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrichedPaths.map((path) => (
              <a
                key={path.id}
                href={`/learning/${path.slug}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  {path.difficultyLevel && (
                    <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full capitalize">
                      {path.difficultyLevel}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {path.moduleCount} modules
                  </span>
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
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
