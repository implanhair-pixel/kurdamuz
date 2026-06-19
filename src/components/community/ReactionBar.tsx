'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ThumbsUp, Lightbulb, PartyPopper, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ReactionBarProps {
  targetType: string;
  targetId: string;
  onReact?: (type: string) => void;
  currentReaction?: string;
}

const REACTION_TYPES = [
  { type: 'like', icon: Heart, label: 'Like', color: 'text-red-500' },
  { type: 'helpful', icon: ThumbsUp, label: 'Helpful', color: 'text-blue-500' },
  { type: 'insightful', icon: Lightbulb, label: 'Insightful', color: 'text-yellow-500' },
  { type: 'celebrate', icon: PartyPopper, label: 'Celebrate', color: 'text-purple-500' },
  { type: 'support', icon: Shield, label: 'Support', color: 'text-green-500' },
];

export function ReactionBar({ targetType, targetId, onReact, currentReaction }: ReactionBarProps) {
  const [selectedReaction, setSelectedReaction] = useState(currentReaction);

  const handleReaction = async (type: string) => {
    if (selectedReaction === type) {
      // Toggle off if same reaction
      setSelectedReaction('');
    } else {
      setSelectedReaction(type);
    }

    if (onReact) {
      await onReact(type);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {REACTION_TYPES.map((reaction) => {
          const Icon = reaction.icon;
          const isSelected = selectedReaction === reaction.type;

          return (
            <Tooltip key={reaction.type}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`gap-1 ${isSelected ? reaction.color : 'text-muted-foreground'}`}
                  onClick={() => handleReaction(reaction.type)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{reaction.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
