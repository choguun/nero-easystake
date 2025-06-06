'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trophy, UserCircle, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSignature } from '@/hooks';
import { useAccount } from 'wagmi';

// Mock data for the leaderboard
const leaderboardData = [
  { rank: 1, user: 'Wallet...A1b2', avatar: 'https://placehold.co/40x40.png', staked: 150000.75, stakedLP: 125000.50, apy: 12.5 },
  { rank: 2, user: 'Wallet...C3d4', avatar: 'https://placehold.co/40x40.png', staked: 125000.50, stakedLP: 110000.00, apy: 12.3 },
  { rank: 3, user: 'Wallet...E5f6', avatar: 'https://placehold.co/40x40.png', staked: 110000.00, stakedLP: 95000.25, apy: 12.1 },
  { rank: 4, user: 'Wallet...G7h8', avatar: 'https://placehold.co/40x40.png', staked: 95000.25, stakedLP: 80000.90, apy: 11.9 },
  { rank: 5, user: 'Wallet...I9j0', avatar: 'https://placehold.co/40x40.png', staked: 80000.90, stakedLP: 65000.75, apy: 11.7 },
  { rank: 6, user: 'Wallet...K1l2', avatar: 'https://placehold.co/40x40.png', staked: 75000.00, stakedLP: 60000.50, apy: 11.5 },
  { rank: 7, user: 'Wallet...M3n4', avatar: 'https://placehold.co/40x40.png', staked: 60000.50, stakedLP: 50000.75, apy: 11.3 },
  { rank: 8, user: 'Wallet...O5p6', avatar: 'https://placehold.co/40x40.png', staked: 50000.75, stakedLP: 45000.00, apy: 11.1 },
  { rank: 9, user: 'Wallet...Q7r8', avatar: 'https://placehold.co/40x40.png', staked: 45000.00, stakedLP: 40000.20, apy: 10.9 },
  { rank: 10, user: 'Wallet...S9t0', avatar: 'https://placehold.co/40x40.png', staked: 40000.20, stakedLP: 35000.50, apy: 10.7 },
];

export default function LeaderboardPage() {
  const { isConnected: isAaConnected, loading: sigContextLoading } = useSignature();
  const { isConnected: isEoaConnected } = useAccount();

  if (sigContextLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center text-center">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!isEoaConnected) {
    return (
        <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center text-center">
            <Card className="max-w-md p-8 text-center shadow-lg">
                <CardHeader>
                    <Wallet className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="mt-4 text-2xl">Connect Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Please connect your wallet to view the leaderboard and manage your account.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!isAaConnected) {
    return (
        <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center text-center">
            <Card className="max-w-md p-8 text-center shadow-lg">
                <CardHeader>
                    <Wallet className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="mt-4 text-2xl">Connect Your Smart Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Your wallet is connected. Please now connect your Smart Account wallet using the button in the header to proceed.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 py-12 md:px-6">
      <Card className="shadow-lg w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Staking Leaderboard
          </CardTitle>
          <CardDescription>
            See who's leading the pack in NERO staking. Top stakers by amount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] text-center">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Staked (WNERO)</TableHead>
                <TableHead className="text-right">Staked (LP)</TableHead>
                <TableHead className="text-right">Est. APY (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry) => (
                <TableRow key={entry.rank}>
                  <TableCell className="font-medium text-center">{entry.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar} alt={entry.user} data-ai-hint="profile avatar" />
                        <AvatarFallback>
                          <UserCircle className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <span>{entry.user}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{entry.staked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">{entry.stakedLP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">{entry.apy.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
