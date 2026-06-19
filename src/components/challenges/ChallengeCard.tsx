'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    challengeType: string;
    difficultyLevel: string;
    scheduledDate: Date;
    endDate: Date;
    participantCount: number;
    xpReward: number;
  };
  onStart?: () => void;
}

export function ChallengeCard({ challenge, onStart }: ChallengeCardProps) {
  const t = useTranslations('challenges');

  const timeRemaining = getTimeRemaining(new Date(challenge.endDate));

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{challenge.title}</CardTitle>
          <Badge variant="secondary">{challenge.challengeType}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {challenge.description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{challenge.participantCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            <span>{challenge.xpReward} XP</span>
          </div>
        </div>
        <Badge variant={getDifficultyVariant(challenge.difficultyLevel)}>
          {challenge.difficultyLevel}
        </Badge>
        {onStart && (
          <Button className="w-full mt-4" onClick={onStart}>
            {t('startChallenge')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function getTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d remaining`;
  if (hours > 0) return `${hours}h remaining`;
  return '< 1h remaining';
}

function getDifficultyVariant(level: string): 'default' | 'secondary' | 'primary' | 'success' | 'warning' | 'danger' {
  switch (level) {
    case 'beginner':
      return 'default';
    case 'intermediate':
      return 'secondary';
    case 'advanced':
      return 'warning';
    case 'expert':
      return 'danger';
    default:
      return 'default';
  }
}
