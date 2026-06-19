import { PostCard } from '@/components/community/PostCard';
import { CommentThread } from '@/components/community/CommentThread';
import { getPostById } from '@/lib/community/posts';
import { getCommentsByPostId } from '@/lib/community/comments';
import { requireAuth } from '@/lib/auth';

export default async function PostPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const user = await requireAuth();
  
  const postResult = await getPostById(id);
  const comments = await getCommentsByPostId(id, { page: 1, limit: 50 });

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <PostCard
          post={postResult}
          currentUserId={user.id}
        />
        <CommentThread
          postId={id}
          comments={comments}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
