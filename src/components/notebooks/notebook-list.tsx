'use client';

import { NotebookCard } from './notebook-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface NotebookListProps {
  notebooks: Array<{
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    entryCount?: number;
  }>;
  onCreate?: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddEntry?: (id: string) => void;
  loading?: boolean;
}

export function NotebookList({
  notebooks,
  onCreate,
  onEdit,
  onDelete,
  onAddEntry,
  loading = false,
}: NotebookListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (notebooks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Plus className="h-12 w-12 text-gray-400 mx-auto" />
        </div>
        <p className="text-gray-500 text-lg mb-4">No notebooks yet</p>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Notebook
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onCreate && (
        <div className="flex justify-end mb-4">
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Notebook
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notebooks.map((notebook) => (
          <NotebookCard
            key={notebook.id}
            notebook={notebook}
            onEdit={() => onEdit?.(notebook.id)}
            onDelete={() => onDelete?.(notebook.id)}
            onAddEntry={() => onAddEntry?.(notebook.id)}
          />
        ))}
      </div>
    </div>
  );
}
