'use client';

import { use, useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, BookOpen, Music, Code, MessageSquare, History, Globe, Lightbulb } from 'lucide-react';
import type { LinguisticAnnotation, CreateLinguisticAnnotationRequest } from '@/types/dialects';

const annotationTypeIcons: Record<string, any> = {
  morphological: Code,
  phonological: Music,
  syntactic: MessageSquare,
  semantic: BookOpen,
  dialect: Globe,
  historical: History,
  usage: Lightbulb,
  research: Tag,
};

const annotationTypeColors: Record<string, string> = {
  morphological: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  phonological: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  syntactic: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  semantic: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  dialect: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  historical: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  usage: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  research: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function LinguisticAnnotationsPage({ params }: { params: Promise<{ entryId: string }> }) {
  const { entryId } = use(params);
  const [annotations, setAnnotations] = useState<LinguisticAnnotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<LinguisticAnnotation | null>(null);

  useEffect(() => {
    loadAnnotations();
  }, [entryId]);

  const loadAnnotations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/dialects/annotations/${entryId}`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data.annotations || []);
      }
    } catch (error) {
      console.error('Error loading annotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<CreateLinguisticAnnotationRequest, 'entryId'>) => {
    try {
      const response = await fetch(`/api/dialects/annotations/${entryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, entryId: entryId }),
      });

      if (response.ok) {
        await loadAnnotations();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating annotation:', error);
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreateLinguisticAnnotationRequest>) => {
    try {
      const response = await fetch(`/api/dialects/annotations/${entryId}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadAnnotations();
        setEditingAnnotation(null);
      }
    } catch (error) {
      console.error('Error updating annotation:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this annotation?')) return;
    
    try {
      const response = await fetch(`/api/dialects/annotations/${entryId}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAnnotations();
      }
    } catch (error) {
      console.error('Error deleting annotation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Tag className="w-8 h-8" />
              Linguistic Annotations
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage morphological, phonological, and semantic annotations
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Annotation
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <AnnotationForm
            entryId={entryId}
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Edit Form */}
        {editingAnnotation && (
          <AnnotationForm
            entryId={entryId}
            annotation={editingAnnotation}
            onSubmit={(data) => handleUpdate(editingAnnotation.id, data)}
            onCancel={() => setEditingAnnotation(null)}
          />
        )}

        {/* Annotations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : annotations.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No annotations yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Add your first annotation to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {annotations.map((annotation) => (
              <AnnotationCard
                key={annotation.id}
                annotation={annotation}
                onEdit={() => setEditingAnnotation(annotation)}
                onDelete={() => handleDelete(annotation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnnotationCard({ annotation, onEdit, onDelete }: {
  annotation: LinguisticAnnotation;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = annotationTypeIcons[annotation.annotationType] || Tag;
  const colorClass = annotationTypeColors[annotation.annotationType] || annotationTypeColors.research;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-purple-500" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colorClass}`}>
            {annotation.annotationType}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <pre className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded overflow-x-auto">
          {JSON.stringify(annotation.annotationData, null, 2)}
        </pre>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(annotation.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function AnnotationForm({
  entryId,
  annotation,
  onSubmit,
  onCancel,
}: {
  entryId: string;
  annotation?: LinguisticAnnotation;
  onSubmit: (data: CreateLinguisticAnnotationRequest) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CreateLinguisticAnnotationRequest>(
    annotation ? {
      entryId,
      annotationType: annotation.annotationType as any,
      annotationData: annotation.annotationData,
    } : {
      entryId,
      annotationType: 'research',
      annotationData: {},
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {annotation ? 'Edit Annotation' : 'Create Annotation'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Annotation Type
          </label>
          <select
            value={formData.annotationType}
            onChange={(e) => setFormData({ ...formData, annotationType: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="morphological">Morphological</option>
            <option value="phonological">Phonological</option>
            <option value="syntactic">Syntactic</option>
            <option value="semantic">Semantic</option>
            <option value="dialect">Dialect</option>
            <option value="historical">Historical</option>
            <option value="usage">Usage</option>
            <option value="research">Research</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Annotation Data (JSON)
          </label>
          <textarea
            value={JSON.stringify(formData.annotationData, null, 2)}
            onChange={(e) => {
              try {
                setFormData({ ...formData, annotationData: JSON.parse(e.target.value) });
              } catch {
                // Invalid JSON, don't update
              }
            }}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            {annotation ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
