'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Filter
} from 'lucide-react';

interface VocabularyDashboardProps {
  onAddVocabulary?: () => void;
  onEditVocabulary?: (id: string) => void;
  onDeleteVocabulary?: (id: string) => void;
}

export function VocabularyDashboard({
  onAddVocabulary,
  onEditVocabulary,
  onDeleteVocabulary,
}: VocabularyDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock statistics - in real implementation, fetch from API
  const stats = {
    totalVocabulary: 1250,
    published: 1100,
    draft: 100,
    archived: 50,
    totalUsers: 450,
    activeReviewers: 120,
    averageMastery: 67,
  };

  // Mock vocabulary data - in real implementation, fetch from API
  const vocabularyList = [
    {
      id: '1',
      kurdishWord: 'سڵاو',
      persianTranslation: 'سلام',
      englishTranslation: 'Hello',
      difficultyLevel: 'beginner',
      status: 'published',
      frequencyRank: 1,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      kurdishWord: 'بەخێربێیت',
      persianTranslation: 'خوب باشید',
      englishTranslation: 'Goodbye',
      difficultyLevel: 'beginner',
      status: 'published',
      frequencyRank: 2,
      createdAt: '2024-01-16',
    },
    {
      id: '3',
      kurdishWord: 'زمان',
      persianTranslation: 'زبان',
      englishTranslation: 'Language',
      difficultyLevel: 'intermediate',
      status: 'draft',
      frequencyRank: 15,
      createdAt: '2024-01-20',
    },
  ];

  const statusColors: Record<string, string> = {
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    archived: 'bg-gray-100 text-gray-800',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-blue-100 text-blue-800',
    elementary: 'bg-cyan-100 text-cyan-800',
    intermediate: 'bg-orange-100 text-orange-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Vocabulary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalVocabulary}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.published} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeReviewers} reviewing today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Mastery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageMastery}%</div>
            <p className="text-xs text-gray-500 mt-1">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Draft Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.draft}</div>
            <p className="text-xs text-gray-500 mt-1">
              Awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vocabulary Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vocabulary Management</CardTitle>
            <Button onClick={onAddVocabulary}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vocabulary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vocabulary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Vocabulary Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Kurdish
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Persian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    English
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Difficulty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vocabularyList.map((vocab) => (
                  <tr key={vocab.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3" dir="rtl">
                      {vocab.kurdishWord}
                    </td>
                    <td className="px-4 py-3" dir="rtl">
                      {vocab.persianTranslation}
                    </td>
                    <td className="px-4 py-3">
                      {vocab.englishTranslation}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={difficultyColors[vocab.difficultyLevel] || ''}>
                        {vocab.difficultyLevel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[vocab.status] || ''}>
                        {vocab.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {vocab.frequencyRank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditVocabulary?.(vocab.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteVocabulary?.(vocab.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
