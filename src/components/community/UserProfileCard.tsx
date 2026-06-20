'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, FileText, Award } from 'lucide-react';

interface UserProfileCardProps {
  profile: any;
  level?: any;
  isOwnProfile?: boolean;
  onEdit?: () => void;
}

export function UserProfileCard({ profile, level, isOwnProfile, onEdit }: UserProfileCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
          <AvatarFallback className="text-2xl">{profile.displayName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <CardTitle className="text-2xl">{profile.displayName}</CardTitle>
          {level && (
            <Badge variant="secondary" className="w-fit">
              Level {level.levelNumber} - {level.title}
            </Badge>
          )}
          {isOwnProfile && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <MessageSquare className="h-5 w-5" />
              {profile.postCount}
            </div>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <FileText className="h-5 w-5" />
              {profile.commentCount}
            </div>
            <p className="text-xs text-muted-foreground">Comments</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Award className="h-5 w-5" />
              {profile.reputationScore}
            </div>
            <p className="text-xs text-muted-foreground">Reputation</p>
          </div>
        </div>

        {level && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="font-medium">{level.currentXP} / {level.requiredXP}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(level.currentXP / level.requiredXP) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
