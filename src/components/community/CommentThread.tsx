'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Reply, MoreHorizontal } from 'lucide-react';
import { ReactionBar } from './ReactionBar';

interface CommentThreadProps {
  postId: string;
  comments: any[];
  onReply?: (commentId: string, content: string) => void;
  onReact?: (commentId: string, type: string) => void;
  currentUserId?: string;
}

export function CommentThread({ postId, comments, onReply, onReact, currentUserId }: CommentThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim()) return;

    if (onReply) {
      await onReply(commentId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const renderComment = (comment: any, depth = 0) => {
    const isOwnComment = comment.author?.id === currentUserId;
    const replies = comments.filter((c) => c.parentCommentId === comment.id);

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
        <Card className="w-full">
          <CardHeader className="flex flex-row items-start gap-3 pb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.author?.avatarUrl} alt={comment.author?.displayName} />
              <AvatarFallback>{comment.author?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium leading-none">{comment.author?.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {isOwnComment && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground">{comment.content}</p>
          </CardContent>
          <CardContent className="pt-0 flex items-center gap-4">
            <ReactionBar
              targetType="comment"
              targetId={comment.id}
              onReact={(type) => onReact?.(comment.id, type)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-4 w-4" />
              Reply
            </Button>
          </CardContent>
        </Card>

        {replyingTo === comment.id && (
          <div className="mt-3 ml-8">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex gap-2 mt-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleReply(comment.id)}>
                Reply
              </Button>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div>
            {replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const topLevelComments = comments.filter((c) => !c.parentCommentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">Comments ({comments.length})</h3>
      </div>
      
      {topLevelComments.length === 0 ? (
        <Card className="w-full">
          <CardContent className="py-8 text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </CardContent>
        </Card>
      ) : (
        <div>
          {topLevelComments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
