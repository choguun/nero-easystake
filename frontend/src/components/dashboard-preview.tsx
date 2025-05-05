
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Database, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartTooltipContent, ChartContainer, ChartTooltip } from '@/components/ui/chart';

// Mock data for the chart
const chartData = [
  { month: 'Jan', rewards: 4.5 },
  { month: 'Feb', rewards: 5.2 },
  { month: 'Mar', rewards: 6.1 },
  { month: 'Apr', rewards: 5.8 },
  { month: 'May', rewards: 6.5 },
  { month: 'Jun', rewards: 7.0 },
];

const chartConfig = {
  rewards: {
    label: "Rewards (%)",
    color: "hsl(var(--accent))", // Teal
  },
} satisfies ChartConfig;

// Type definition for chart config (based on shadcn/ui chart example)
type ChartConfig = {
  [key: string]: {
    label: React.ReactNode;
    color: string;
  };
};


export function DashboardPreview() {
    // Using static values for preview
    const totalStaked = 1250.75;
    const currentAPY = 12.3;
    const lifetimeRewards = 150.20;
    const vaultUtilization = 85; // Percentage

  return (
    <Card className="w-full max-w-2xl shadow-lg border border-border/50 bg-gradient-to-br from-card via-background to-secondary/10 p-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Staking Dashboard Preview
        </CardTitle>
        <CardDescription>Overview of your NERO LST staking performance.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Card className="bg-background/70">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Total Staked (NERO LST)</CardDescription>
              <CardTitle className="text-2xl">{totalStaked.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
           <Card className="bg-background/70">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Current APY</CardDescription>
              <CardTitle className="text-2xl">{currentAPY.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-background/70 col-span-2 md:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm">Lifetime Rewards (NERO LST)</CardDescription>
              <CardTitle className="text-2xl">{lifetimeRewards.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Vault Performance */}
        <Card className="bg-background/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
                 <Database className="h-4 w-4 text-accent" />
                Smart Vault Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Vault Utilization</span>
                <span className="font-medium">{vaultUtilization}%</span>
              </div>
              <Progress value={vaultUtilization} aria-label={`${vaultUtilization}% vault utilization`} className="h-2" />
               <p className="text-xs text-muted-foreground pt-1">
                  Represents the percentage of vault capacity currently utilized for optimal staking.
                </p>
            </div>
          </CardContent>
        </Card>


        {/* Rewards Chart */}
         <Card className="bg-background/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Rewards Trend</CardTitle>
            <CardDescription className="text-sm">Estimated rewards percentage over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border)/0.5)" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} unit="%" />
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="rewards" fill="var(--color-rewards)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>


        {/* AI Recommendation Snippet */}
        <Card className="bg-background/70 border-l-4 border-accent">
          <CardHeader className="pb-2">
             <CardTitle className="text-lg flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4 text-accent" />
                AI Recommendation
             </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground"> {/* Changed from <p> to <div> */}
                Based on current conditions and your <Badge variant="secondary" className="mx-1">Medium</Badge> risk profile, the AI suggests maintaining current allocation. Consider slight increase if block height surpasses 1,200,000.
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
