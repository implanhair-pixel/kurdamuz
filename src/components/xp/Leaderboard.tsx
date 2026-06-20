import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import type { Leaderboard } from '@/types/xp';

interface LeaderboardProps {
  leaderboard: Leaderboard;
  showUserPosition?: boolean;
}

export function Leaderboard({ leaderboard, showUserPosition = true }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="font-semibold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">#1</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">#2</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 text-white">#3</Badge>;
    return <Badge variant="secondary">#{rank}</Badge>;
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </h3>
        <Badge variant="secondary">{leaderboard.timeframe}</Badge>
      </div>

      {showUserPosition && leaderboard.userRank && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRankIcon(leaderboard.userRank)}
              <div>
                <p className="text-sm text-muted-foreground">Your Position</p>
                <p className="font-semibold">Rank #{leaderboard.userRank}</p>
              </div>
            </div>
            {leaderboard.userEntry && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">XP Gained</p>
                <p className="font-semibold text-primary">+{leaderboard.userEntry.xpGained.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Total XP</TableHead>
            <TableHead>XP Gained</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No leaderboard data available
              </TableCell>
            </TableRow>
          ) : (
            leaderboard.entries.map((entry) => (
              <TableRow key={entry.userId}>
                <TableCell>{getRankBadge(entry.rank)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRankIcon(entry.rank)}
                    <span className="font-medium">
                      {entry.username || `User ${entry.userId.slice(0, 8)}...`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Level {entry.level}</Badge>
                </TableCell>
                <TableCell className="font-semibold">{entry.totalXP.toLocaleString()}</TableCell>
                <TableCell className="text-green-600 font-semibold">
                  +{entry.xpGained.toLocaleString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
