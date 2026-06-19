'use client';

import { useState, useEffect } from 'react';
import { FolderPlus, FolderOpen, Plus, Trash2, Edit, BookOpen, Search, Filter } from 'lucide-react';
import type { ResearchCollection, CreateResearchCollectionRequest } from '@/types/dialects';

export default function ResearchWorkspacePage() {
  const [collections, setCollections] = useState<ResearchCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<ResearchCollection | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<ResearchCollection | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dialects/research/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateResearchCollectionRequest) => {
    try {
      const response = await fetch('/api/dialects/research/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadCollections();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const handleUpdate = async (id: string, data: Partial<CreateResearchCollectionRequest>) => {
    try {
      const response = await fetch(`/api/dialects/research/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await loadCollections();
        setEditingCollection(null);
      }
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    
    try {
      const response = await fetch(`/api/dialects/research/collections/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCollections();
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <FolderOpen className="w-8 h-8" />
              Research Workspace
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Curate and organize lexical collections for research
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <FolderPlus className="w-5 h-5" />
            New Collection
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <CollectionForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        {/* Edit Form */}
        {editingCollection && (
          <CollectionForm
            collection={editingCollection}
            onSubmit={(data) => handleUpdate(editingCollection.id, data)}
            onCancel={() => setEditingCollection(null)}
          />
        )}

        {/* Collections Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No collections yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Create your first collection to start organizing your research
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={() => setEditingCollection(collection)}
                onDelete={() => handleDelete(collection.id)}
                onSelect={() => setSelectedCollection(collection)}
              />
            ))}
          </div>
        )}

        {/* Collection Detail View */}
        {selectedCollection && (
          <CollectionDetailView
            collection={selectedCollection}
            onClose={() => setSelectedCollection(null)}
          />
        )}
      </div>
    </div>
  );
}

function CollectionCard({
  collection,
  onEdit,
  onDelete,
  onSelect,
}: {
  collection: ResearchCollection;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1" onClick={onSelect}>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {collection.title}
          </h3>
          {collection.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              {collection.description}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Created {new Date(collection.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <BookOpen className="w-4 h-4" />
        <span>0 entries</span>
      </div>
    </div>
  );
}

function CollectionForm({
  collection,
  onSubmit,
  onCancel,
}: {
  collection?: ResearchCollection;
  onSubmit: (data: CreateResearchCollectionRequest) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CreateResearchCollectionRequest>(
    collection ? {
      title: collection.title,
      description: collection.description || undefined,
    } : {
      title: '',
      description: undefined,
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {collection ? 'Edit Collection' : 'Create Collection'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (optional)
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg"
          >
            {collection ? 'Update' : 'Create'}
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

function CollectionDetailView({
  collection,
  onClose,
}: {
  collection: ResearchCollection;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {collection.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          {collection.description && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {collection.description}
            </p>
          )}
        </div>

        <div className="p-6">
          {/* Search within collection */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search within collection..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Add entry to collection */}
          <div className="mb-6">
            <button className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-300">
                Add entries to this collection
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Search and select vocabulary items to add
              </p>
            </button>
          </div>

          {/* Collection entries */}
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              No entries in this collection yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Add vocabulary items to start building your research collection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
