"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Database, ShieldCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartTooltipContent,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";

// Mock data for the chart
const chartData = [
  { month: "Jan", rewards: 4.5 },
  { month: "Feb", rewards: 5.2 },
  { month: "Mar", rewards: 6.1 },
  { month: "Apr", rewards: 5.8 },
  { month: "May", rewards: 6.5 },
  { month: "Jun", rewards: 7.0 },
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
  const lifetimeRewards = 150.2;
  const vaultUtilization = 85; // Percentage

  return (
    <Card
      className="w-full max-w-2xl shadow-lg border border-border/50 bg-gradient-to-br from-card via-background to-secondary/10 p-2"
      data-oid="6z7bpgg"
    >
      <CardHeader className="pb-4" data-oid="a0nll.j">
        <CardTitle
          className="text-xl flex items-center gap-2"
          data-oid="g5oq4f5"
        >
          <TrendingUp className="h-5 w-5 text-primary" data-oid="u1mq1a7" />
          Staking Dashboard Preview
        </CardTitle>
        <CardDescription data-oid="u-h0e8z">
          Overview of your NERO LST staking performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6" data-oid="o35_.vi">
        {/* Key Metrics */}
        <div
          className="grid grid-cols-2 gap-4 md:grid-cols-3"
          data-oid="mk0c4aq"
        >
          <Card className="bg-background/70" data-oid="x2ugn_f">
            <CardHeader className="pb-2" data-oid="_njstsv">
              <CardDescription className="text-sm" data-oid="76qqhf6">
                Total Staked (NERO LST)
              </CardDescription>
              <CardTitle className="text-2xl" data-oid="-xepih8">
                {totalStaked.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-background/70" data-oid="matrbfl">
            <CardHeader className="pb-2" data-oid="kc_q:g.">
              <CardDescription className="text-sm" data-oid="gm01_uu">
                Current APY
              </CardDescription>
              <CardTitle className="text-2xl" data-oid="ncilij9">
                {currentAPY.toFixed(1)}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className="bg-background/70 col-span-2 md:col-span-1"
            data-oid="udgjdda"
          >
            <CardHeader className="pb-2" data-oid="m1j4pq2">
              <CardDescription className="text-sm" data-oid="n:yltjb">
                Lifetime Rewards (NERO LST)
              </CardDescription>
              <CardTitle className="text-2xl" data-oid=":nxkc9n">
                {lifetimeRewards.toFixed(2)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Vault Performance */}
        <Card className="bg-background/70" data-oid="76ox_hy">
          <CardHeader className="pb-2" data-oid="etpo83b">
            <CardTitle
              className="text-lg flex items-center gap-2"
              data-oid="iq7keny"
            >
              <Database className="h-4 w-4 text-accent" data-oid="s:j8v__" />
              Smart Vault Performance
            </CardTitle>
          </CardHeader>
          <CardContent data-oid=":z8_khz">
            <div className="space-y-2" data-oid="x2-1hel">
              <div
                className="flex justify-between items-center text-sm"
                data-oid="v_3g6sx"
              >
                <span data-oid="va-q_sp">Vault Utilization</span>
                <span className="font-medium" data-oid="z9gkacu">
                  {vaultUtilization}%
                </span>
              </div>
              <Progress
                value={vaultUtilization}
                aria-label={`${vaultUtilization}% vault utilization`}
                className="h-2"
                data-oid=".qc4tt6"
              />

              <p
                className="text-xs text-muted-foreground pt-1"
                data-oid="rbhv0vr"
              >
                Represents the percentage of vault capacity currently utilized
                for optimal staking.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Chart */}
        <Card className="bg-background/70" data-oid="ul.hzpv">
          <CardHeader className="pb-2" data-oid="5m2ib3.">
            <CardTitle className="text-lg" data-oid="0i-47_-">
              Monthly Rewards Trend
            </CardTitle>
            <CardDescription className="text-sm" data-oid="rrw824h">
              Estimated rewards percentage over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent data-oid="s9vfpkr">
            <ChartContainer
              config={chartConfig}
              className="h-[200px] w-full"
              data-oid="z4w-6vv"
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
                data-oid="5n7zfm1"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  data-oid="yebevq."
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border)/0.5)"
                    data-oid="7fgivm1"
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    data-oid="i742k:z"
                  />

                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                    unit="%"
                    data-oid="cia46oi"
                  />

                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent indicator="dot" data-oid="zuk7130" />
                    }
                    data-oid="7j48b1d"
                  />

                  <Bar
                    dataKey="rewards"
                    fill="var(--color-rewards)"
                    radius={4}
                    data-oid="_3jbdae"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* AI Recommendation Snippet */}
        <Card
          className="bg-background/70 border-l-4 border-accent"
          data-oid="h75suc5"
        >
          <CardHeader className="pb-2" data-oid="6cvv0mb">
            <CardTitle
              className="text-lg flex items-center gap-2"
              data-oid="ey1ei8v"
            >
              <ShieldCheck className="h-4 w-4 text-accent" data-oid="89n-:7z" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent data-oid="ryw:5cx">
            <div className="text-sm text-muted-foreground" data-oid="m59my33">
              {" "}
              {/* Changed from <p> to <div> */}
              Based on current conditions and your{" "}
              <Badge variant="secondary" className="mx-1" data-oid="_xa7rhv">
                Medium
              </Badge>{" "}
              risk profile, the AI suggests maintaining current allocation.
              Consider slight increase if block height surpasses 1,200,000.
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
