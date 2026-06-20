'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface LeaderboardTableProps {
  entries: Array<{
    rank: number;
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
    score: number;
    change?: number;
  }>;
  currentUserId?: string;
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const t = useTranslations('leaderboard');

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">{t('rank')}</TableHead>
          <TableHead>{t('user')}</TableHead>
          <TableHead className="text-right">{t('score')}</TableHead>
          <TableHead className="w-16">{t('change')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow
            key={entry.user.id}
            className={entry.user.id === currentUserId ? 'bg-muted/50' : ''}
          >
            <TableCell>
              <Badge variant={entry.rank <= 3 ? 'default' : 'secondary'}>
                #{entry.rank}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={entry.user.avatar} />
                  <AvatarFallback>
                    {entry.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{entry.user.name}</span>
              </div>
            </TableCell>
            <TableCell className="text-right font-bold">
              {entry.score.toLocaleString()}
            </TableCell>
            <TableCell>
              {entry.change === undefined ? (
                <Minus className="w-4 h-4 text-muted-foreground" />
              ) : entry.change > 0 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{entry.change}</span>
                </div>
              ) : entry.change < 0 ? (
                <div className="flex items-center gap-1 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  <span>{entry.change}</span>
                </div>
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
