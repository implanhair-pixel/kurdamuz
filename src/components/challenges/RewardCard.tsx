'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Check, Trophy, Star, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RewardCardProps {
  reward: {
    id: string;
    rewardType: string;
    rewardValue: Record<string, any>;
    awardedAt: Date;
    isClaimed: boolean;
    claimedAt?: Date;
  };
  onClaim?: (rewardId: string) => void;
}

export function RewardCard({ reward, onClaim }: RewardCardProps) {
  const t = useTranslations('rewards');

  const icon = getRewardIcon(reward.rewardType);
  const title = getRewardTitle(reward.rewardType, reward.rewardValue);
  const description = getRewardDescription(reward.rewardType, reward.rewardValue);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {icon}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {reward.isClaimed && (
            <Badge variant="default" className="bg-green-600">
              <Check className="w-3 h-3 mr-1" />
              {t('claimed')}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {!reward.isClaimed && onClaim && (
          <Button className="w-full" onClick={() => onClaim(reward.id)}>
            <Gift className="w-4 h-4 mr-2" />
            {t('claimReward')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function getRewardIcon(rewardType: string) {
  switch (rewardType) {
    case 'xp':
      return <Star className="w-5 h-5 text-yellow-500" />;
    case 'badge':
      return <Award className="w-5 h-5 text-blue-500" />;
    case 'achievement':
      return <Trophy className="w-5 h-5 text-purple-500" />;
    case 'title':
      return <Award className="w-5 h-5 text-orange-500" />;
    case 'decoration':
      return <Gift className="w-5 h-5 text-pink-500" />;
    default:
      return <Gift className="w-5 h-5 text-gray-500" />;
  }
}

function getRewardTitle(rewardType: string, rewardValue: Record<string, any>): string {
  switch (rewardType) {
    case 'xp':
      return `${rewardValue.amount} XP${rewardValue.bonus ? ' (Bonus)' : ''}`;
    case 'badge':
      return 'Badge Reward';
    case 'achievement':
      return 'Achievement Unlocked';
    case 'title':
      return rewardValue.title || 'Title Reward';
    case 'decoration':
      return rewardValue.decoration || 'Decoration';
    case 'course_access':
      return 'Course Access';
    default:
      return 'Reward';
  }
}

function getRewardDescription(rewardType: string, rewardValue: Record<string, any>): string {
  switch (rewardType) {
    case 'xp':
      return 'Experience points added to your account';
    case 'badge':
      return 'A special badge for your profile';
    case 'achievement':
      return 'An achievement milestone reached';
    case 'title':
      return 'A special title for your profile';
    case 'decoration':
      return 'A decorative item for your profile';
    case 'course_access':
      return 'Access to a premium course';
    default:
      return 'A reward for your achievement';
  }
}
