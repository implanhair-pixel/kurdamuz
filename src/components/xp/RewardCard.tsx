import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Lock, Check, Clock } from 'lucide-react';
import type { Reward, UserReward } from '@/types/xp';

interface RewardCardProps {
  reward: Reward;
  userReward?: UserReward;
  onClaim?: (rewardId: string) => void;
  showClaimButton?: boolean;
}

export function RewardCard({ reward, userReward, onClaim, showClaimButton = true }: RewardCardProps) {
  const isClaimed = userReward?.status === 'claimed';
  const isAvailable = userReward?.status === 'available' || !userReward;
  const isExpired = userReward?.status === 'expired';

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'badge':
        return '🏆';
      case 'certificate':
        return '📜';
      case 'avatar_item':
        return '🎭';
      case 'profile_decoration':
        return '✨';
      case 'course_unlock':
        return '📚';
      case 'special_content':
        return '🎬';
      case 'event_access':
        return '🎟️';
      default:
        return '🎁';
    }
  };

  const getStatusBadge = () => {
    if (isClaimed) {
      return (
        <Badge variant="default" className="bg-green-500">
          <Check className="h-3 w-3 mr-1" />
          Claimed
        </Badge>
      );
    }
    if (isExpired) {
      return (
        <Badge variant="secondary" className="bg-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }
    if (isAvailable) {
      return (
        <Badge variant="default" className="bg-blue-500">
          <Gift className="h-3 w-3 mr-1" />
          Available
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-gray-500">
        <Lock className="h-3 w-3 mr-1" />
        Locked
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getRewardIcon(reward.rewardType)}</div>
            <div>
              <CardTitle className="text-lg">{reward.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type</span>
          <Badge variant="secondary">{reward.rewardType.replace(/_/g, ' ')}</Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Required Level</span>
          <span className="font-medium">Level {reward.requiredLevel}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Required XP</span>
          <span className="font-medium">{reward.requiredXP.toLocaleString()} XP</span>
        </div>
      </CardContent>
      {showClaimButton && isAvailable && onClaim && (
        <CardFooter>
          <Button onClick={() => onClaim(reward.id)} className="w-full">
            Claim Reward
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
