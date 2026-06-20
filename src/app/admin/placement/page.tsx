'use client';

import Link from 'next/link';

export default function PlacementAdminPage() {
  const adminSections = [
    {
      title: 'Question Bank',
      description: 'Manage placement test questions',
      href: '/admin/placement/questions',
    },
    {
      title: 'Assessments',
      description: 'Manage placement test assessments',
      href: '/admin/placement/assessments',
    },
    {
      title: 'Analytics',
      description: 'View placement test analytics',
      href: '/admin/placement/analytics',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Placement Test Admin</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
              <p className="text-gray-600">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
