'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Book, Trash2, Edit, Plus } from 'lucide-react';

interface NotebookCardProps {
  notebook: {
    id: string;
    title: string;
    description?: string;
    createdAt: string;
    entryCount?: number;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onAddEntry?: () => void;
}

export function NotebookCard({
  notebook,
  onEdit,
  onDelete,
  onAddEntry,
}: NotebookCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Book className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{notebook.title}</h3>
              {notebook.description && (
                <p className="text-sm text-gray-600 mt-1">{notebook.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddEntry}
              className="h-8 w-8 p-0"
              title="Add vocabulary"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
              title="Edit notebook"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              title="Delete notebook"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            {notebook.entryCount || 0} words
          </Badge>
          <span className="text-xs text-gray-500">
            {new Date(notebook.createdAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
