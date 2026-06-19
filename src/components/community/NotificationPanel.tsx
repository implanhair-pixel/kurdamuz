'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, Check, Trash2, MessageSquare, Heart, Shield, Award, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  notifications: any[];
  unreadCount: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (id: string) => void;
}

const NOTIFICATION_ICONS: Record<string, any> = {
  post_reaction: Heart,
  comment_reply: MessageSquare,
  mention: MessageSquare,
  moderation_action: Shield,
  report_update: Shield,
  achievement_unlock: Award,
  announcement: Megaphone,
};

const NOTIFICATION_COLORS: Record<string, string> = {
  post_reaction: 'text-red-500',
  comment_reply: 'text-blue-500',
  mention: 'text-purple-500',
  moderation_action: 'text-orange-500',
  report_update: 'text-orange-500',
  achievement_unlock: 'text-yellow-500',
  announcement: 'text-green-500',
};

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationPanelProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.readStatus : true
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="danger">{unreadCount}</Badge>
          )}
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          >
            {filter === 'all' ? 'Show Unread' : 'Show All'}
          </Button>
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.notificationType] || Bell;
                const color = NOTIFICATION_COLORS[notification.notificationType] || 'text-gray-500';

                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      !notification.readStatus ? 'bg-secondary/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {getNotificationTitle(notification.notificationType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getNotificationMessage(notification.notificationType, notification.payload)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.readStatus && onMarkAsRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8"
                            onClick={() => onDelete(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    post_reaction: 'New Reaction',
    comment_reply: 'Reply to Comment',
    mention: 'You were mentioned',
    moderation_action: 'Moderation Action',
    report_update: 'Report Update',
    achievement_unlock: 'Achievement Unlocked',
    announcement: 'Announcement',
  };
  return titles[type] || 'Notification';
}

function getNotificationMessage(type: string, payload: any): string {
  const messages: Record<string, (payload: any) => string> = {
    post_reaction: (p) => `Someone reacted to your post with ${p.reactionType}`,
    comment_reply: (p) => 'Someone replied to your comment',
    mention: (p) => 'You were mentioned in a post',
    moderation_action: (p) => `Moderation action: ${p.actionType}`,
    report_update: (p) => `Report status: ${p.status}`,
    achievement_unlock: (p) => `You unlocked: ${p.achievementName}`,
    announcement: (p) => p.title || 'New announcement',
  };
  
  const messageFn = messages[type];
  return messageFn ? messageFn(payload) : 'New notification';
}
