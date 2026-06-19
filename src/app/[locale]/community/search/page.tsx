import { PostCard } from '@/components/community/PostCard';
import { UserProfileCard } from '@/components/community/UserProfileCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { requireAuth } from '@/lib/auth';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string; type?: string };
}) {
  const user = await requireAuth();
  const query = searchParams.query || '';
  const type = searchParams.type || 'all';

  let searchResults = { posts: [], comments: [], users: [] };

  if (query) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/community/search?query=${encodeURIComponent(query)}&type=${type}`,
        { cache: 'no-store' }
      );
      
      if (response.ok) {
        const data = await response.json();
        searchResults = data.results || { posts: [], comments: [], users: [] };
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <form method="GET" className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, comments, and users..."
              defaultValue={query}
              className="pl-10"
              name="query"
            />
          </div>
          <Select defaultValue={type} name="type">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="posts">Posts</SelectItem>
              <SelectItem value="comments">Comments</SelectItem>
              <SelectItem value="users">Users</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Search</Button>
        </form>

        {query ? (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Search results for "{query}"
            </p>

            {searchResults.posts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Posts</h2>
                {searchResults.posts.map((post: any) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={user.id}
                  />
                ))}
              </div>
            )}

            {searchResults.comments.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Comments</h2>
                <div className="space-y-3">
                  {searchResults.comments.map((comment: any) => (
                    <div key={comment.id} className="p-4 border rounded-lg">
                      <p className="text-sm">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.users.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Users</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.users.map((profile: any) => (
                    <UserProfileCard
                      key={profile.id}
                      profile={profile}
                      isOwnProfile={profile.userId === user.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {searchResults.posts.length === 0 && 
             searchResults.comments.length === 0 && 
             searchResults.users.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No results found for "{query}"
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Enter a search query to find posts, comments, and users
          </div>
        )}
      </div>
    </div>
  );
}
