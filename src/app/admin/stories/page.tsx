'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stories')
      .then((res) => res.json())
      .then((data) => {
        setStories(data.stories || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching stories:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Story Management</h1>
          <p className="text-muted-foreground">Manage all stories in the library</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Story
        </Button>
      </div>

      <div className="grid gap-4">
        {stories.map((story) => (
          <Card key={story.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{story.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge>{story.status}</Badge>
                    <Badge>{story.difficultyLevel}</Badge>
                    {story.isFeatured && <Badge>Featured</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-2">{story.summary}</p>
              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <span>Created: {new Date(story.createdAt).toLocaleDateString()}</span>
                {story.publishedAt && (
                  <span>Published: {new Date(story.publishedAt).toLocaleDateString()}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
