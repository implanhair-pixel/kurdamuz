import { UserProfileCard } from '@/components/community/UserProfileCard';
import { PostCard } from '@/components/community/PostCard';
import { getProfileByUserId, getProfileStats, getUserPosts, getUserComments } from '@/lib/community/profiles';
import { requireAuth } from '@/lib/auth';

export default async function ProfilePage({ params }: { params: Promise<{ userId: string; locale: string }> }) {
  const { userId } = await params;
  const user = await requireAuth();
  
  const profile = await getProfileByUserId(userId);
  const profileStats = await getProfileStats(profile.id);
  const userPosts = await getUserPosts(userId, { page: 1, limit: 10 });
  const userComments = await getUserComments(userId, { page: 1, limit: 10 });

  const isOwnProfile = profile.userId === user.id;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <UserProfileCard
          profile={profile}
          level={profileStats.level}
          isOwnProfile={isOwnProfile}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            {userPosts.length === 0 ? (
              <p className="text-muted-foreground">No posts yet</p>
            ) : (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user.id}
                />
              ))
            )}
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Comments</h2>
            {userComments.length === 0 ? (
              <p className="text-muted-foreground">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {userComments.map((comment) => (
                  <div key={comment.id} className="p-4 border rounded-lg">
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
