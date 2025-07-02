"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, UserCircle, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSignature } from "@/hooks";
import { useAccount } from "wagmi";

// Mock data for the leaderboard
const leaderboardData = [
  {
    rank: 1,
    user: "Wallet...A1b2",
    avatar: "https://placehold.co/40x40.png",
    staked: 150000.75,
    stakedLP: 125000.5,
    apy: 12.5,
  },
  {
    rank: 2,
    user: "Wallet...C3d4",
    avatar: "https://placehold.co/40x40.png",
    staked: 125000.5,
    stakedLP: 110000.0,
    apy: 12.3,
  },
  {
    rank: 3,
    user: "Wallet...E5f6",
    avatar: "https://placehold.co/40x40.png",
    staked: 110000.0,
    stakedLP: 95000.25,
    apy: 12.1,
  },
  {
    rank: 4,
    user: "Wallet...G7h8",
    avatar: "https://placehold.co/40x40.png",
    staked: 95000.25,
    stakedLP: 80000.9,
    apy: 11.9,
  },
  {
    rank: 5,
    user: "Wallet...I9j0",
    avatar: "https://placehold.co/40x40.png",
    staked: 80000.9,
    stakedLP: 65000.75,
    apy: 11.7,
  },
  {
    rank: 6,
    user: "Wallet...K1l2",
    avatar: "https://placehold.co/40x40.png",
    staked: 75000.0,
    stakedLP: 60000.5,
    apy: 11.5,
  },
  {
    rank: 7,
    user: "Wallet...M3n4",
    avatar: "https://placehold.co/40x40.png",
    staked: 60000.5,
    stakedLP: 50000.75,
    apy: 11.3,
  },
  {
    rank: 8,
    user: "Wallet...O5p6",
    avatar: "https://placehold.co/40x40.png",
    staked: 50000.75,
    stakedLP: 45000.0,
    apy: 11.1,
  },
  {
    rank: 9,
    user: "Wallet...Q7r8",
    avatar: "https://placehold.co/40x40.png",
    staked: 45000.0,
    stakedLP: 40000.2,
    apy: 10.9,
  },
  {
    rank: 10,
    user: "Wallet...S9t0",
    avatar: "https://placehold.co/40x40.png",
    staked: 40000.2,
    stakedLP: 35000.5,
    apy: 10.7,
  },
];

export default function LeaderboardPage() {
  const { isConnected: isAaConnected, loading: sigContextLoading } =
    useSignature();
  const { isConnected: isEoaConnected } = useAccount();

  if (sigContextLoading) {
    return (
      <div
        className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center text-center"
        data-oid="xaoueot"
      >
        <p data-oid=".y1r-kg">Loading session...</p>
      </div>
    );
  }

  if (!isEoaConnected) {
    return (
      <div
        className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center text-center"
        data-oid="24tm8qj"
      >
        <Card className="max-w-md p-8 text-center shadow-lg" data-oid="tlwh5i0">
          <CardHeader data-oid="16o4jmx">
            <Wallet
              className="mx-auto h-12 w-12 text-primary"
              data-oid="c8l7-7q"
            />

            <CardTitle className="mt-4 text-2xl" data-oid="72o7nik">
              Connect Wallet
            </CardTitle>
          </CardHeader>
          <CardContent data-oid="8_9::es">
            <p className="text-muted-foreground" data-oid="4.i-on1">
              Please connect your wallet to view the leaderboard and manage your
              account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAaConnected) {
    return (
      <div
        className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center text-center"
        data-oid="hzy6bwo"
      >
        <Card className="max-w-md p-8 text-center shadow-lg" data-oid="tyqynco">
          <CardHeader data-oid="yqyyb0p">
            <Wallet
              className="mx-auto h-12 w-12 text-primary"
              data-oid="udk66.l"
            />

            <CardTitle className="mt-4 text-2xl" data-oid="n-wd4ur">
              Connect Your Smart Account
            </CardTitle>
          </CardHeader>
          <CardContent data-oid="21jbv_u">
            <p className="text-muted-foreground" data-oid="1cr53sz">
              Your wallet is connected. Please now connect your Smart Account
              wallet using the button in the header to proceed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 py-12 md:px-6"
      data-oid="uihjw6h"
    >
      <Card className="shadow-lg w-full max-w-3xl" data-oid="vx2kwg2">
        <CardHeader data-oid="z8er-bd">
          <CardTitle
            className="text-2xl flex items-center gap-2"
            data-oid="_knt8tk"
          >
            <Trophy className="h-6 w-6 text-primary" data-oid="gm-09fi" />
            Staking Leaderboard
          </CardTitle>
          <CardDescription data-oid="lbmey-b">
            See who's leading the pack in NERO staking. Top stakers by amount.
          </CardDescription>
        </CardHeader>
        <CardContent data-oid="p08gish">
          <Table data-oid="t6vw7q4">
            <TableHeader data-oid="lp7ypnb">
              <TableRow data-oid="i.fy3j6">
                <TableHead className="w-[80px] text-center" data-oid="z6zyibt">
                  Rank
                </TableHead>
                <TableHead data-oid="f.d105d">User</TableHead>
                <TableHead className="text-right" data-oid="zofvyhn">
                  Staked (WNERO)
                </TableHead>
                <TableHead className="text-right" data-oid="y1es99:">
                  Staked (LP)
                </TableHead>
                <TableHead className="text-right" data-oid="bxm7li:">
                  Est. APY (%)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-oid="ocven45">
              {leaderboardData.map((entry) => (
                <TableRow key={entry.rank} data-oid="dscr-ut">
                  <TableCell
                    className="font-medium text-center"
                    data-oid="e4yf3gw"
                  >
                    {entry.rank}
                  </TableCell>
                  <TableCell data-oid="llwafre">
                    <div className="flex items-center gap-2" data-oid="_s8kbu:">
                      <Avatar className="h-8 w-8" data-oid="vpfxacv">
                        <AvatarImage
                          src={entry.avatar}
                          alt={entry.user}
                          data-ai-hint="profile avatar"
                          data-oid="rc4.evm"
                        />

                        <AvatarFallback data-oid="dov7oh1">
                          <UserCircle
                            className="h-5 w-5 text-muted-foreground"
                            data-oid="ds8.jpn"
                          />
                        </AvatarFallback>
                      </Avatar>
                      <span data-oid="o82j_31">{entry.user}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right" data-oid="wh3i7dj">
                    {entry.staked.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right" data-oid="xu_mdlx">
                    {entry.stakedLP.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right" data-oid="5h-0p-6">
                    {entry.apy.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
