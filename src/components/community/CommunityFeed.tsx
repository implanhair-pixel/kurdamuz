'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PostCard } from './PostCard';
import { PostEditor } from './PostEditor';
import { Search, Filter, Plus } from 'lucide-react';

interface CommunityFeedProps {
  posts: any[];
  currentUserId?: string;
  onCreatePost?: (data: any) => void;
  onPostReact?: (postId: string, type: string) => void;
  onPostComment?: (postId: string) => void;
  onPostReport?: (postId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function CommunityFeed({
  posts,
  currentUserId,
  onCreatePost,
  onPostReact,
  onPostComment,
  onPostReport,
  onLoadMore,
  hasMore = false,
}: CommunityFeedProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState('all');

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || post.postType === filterType;

    return matchesSearch && matchesType;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.reactionCount - a.reactionCount;
      case 'trending':
        return b.reactionCount / (Date.now() - new Date(a.createdAt).getTime()) -
               a.reactionCount / (Date.now() - new Date(b.createdAt).getTime());
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Create Post Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowEditor(!showEditor)} className="gap-2">
          {showEditor ? (
            <>Cancel</>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create Post
            </>
          )}
        </Button>
      </div>

      {/* Post Editor */}
      {showEditor && (
        <PostEditor
          onSubmit={async (data) => {
            if (onCreatePost) {
              await onCreatePost(data);
              setShowEditor(false);
            }
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="discussion">Discussion</SelectItem>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="tip">Learning Tip</SelectItem>
              <SelectItem value="experience">Experience</SelectItem>
              <SelectItem value="success">Success Story</SelectItem>
              <SelectItem value="course_discussion">Course Discussion</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || filterType !== 'all'
              ? 'No posts match your search criteria'
              : 'No posts yet. Be the first to share!'}
          </div>
        ) : (
          <>
            {sortedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onReact={(type) => onPostReact?.(post.id, type)}
                onComment={() => onPostComment?.(post.id)}
                onReport={() => onPostReport?.(post.id)}
              />
            ))}
            {hasMore && onLoadMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={onLoadMore}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
