'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Heart, Eye, MoreHorizontal } from 'lucide-react';
import { ReactionBar } from './ReactionBar';

interface PostCardProps {
  post: any;
  onComment?: () => void;
  onReact?: (type: string) => void;
  onReport?: () => void;
  currentUserId?: string;
}

export function PostCard({ post, onComment, onReact, onReport, currentUserId }: PostCardProps) {
  const isOwnPost = post.author?.id === currentUserId;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author?.avatarUrl} alt={post.author?.displayName} />
          <AvatarFallback>{post.author?.displayName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium leading-none">{post.author?.displayName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">
              {post.postType}
            </span>
          </div>
          <h3 className="text-lg font-semibold">{post.title}</h3>
        </div>
        {isOwnPost && (
          <Button variant="ghost" size="sm" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-4">
          <ReactionBar
            targetType="post"
            targetId={post.id}
            onReact={onReact}
          />
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={onComment}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentCount}</span>
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{post.viewCount}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReport}
          className="text-muted-foreground"
        >
          Report
        </Button>
      </CardFooter>
    </Card>
  );
}
