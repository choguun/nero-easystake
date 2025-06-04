
'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Gift, PlusCircle, MinusCircle, Percent, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

// Mock data - replace with actual data fetching
const MOCK_LP_BALANCE = 250.75; // User's NERO-stNERO LP tokens
const MOCK_STAKED_LP_BALANCE = 100.50;
const MOCK_EARNED_PLATFORM_TOKENS = 42.80;
const PLATFORM_TOKEN_SYMBOL = "EASY";
const MOCK_LP_STAKING_APY = 15.5; // APY for staking LP tokens

interface InfoCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ElementType;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, unit, icon: Icon }) => (
  <Card className="bg-background/70 text-center">
    <CardHeader className="pb-2">
      <CardDescription className="text-sm flex items-center justify-center gap-1">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {title}
      </CardDescription>
      <CardTitle className="text-2xl">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-lg ml-1">{unit}</span>}
      </CardTitle>
    </CardHeader>
  </Card>
);

export default function RewardsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Stake LP State
  const [stakeLpAmount, setStakeLpAmount] = useState<string>('');

  // Unstake LP State
  const [unstakeLpPercentSlider, setUnstakeLpPercentSlider] = useState<number[]>([50]);
  const [unstakeLpAmount, setUnstakeLpAmount] = useState<string>((MOCK_STAKED_LP_BALANCE * 0.5).toFixed(4));

  // Effect for Unstake LP: Calculate amount from percentage
  useEffect(() => {
    const percent = unstakeLpPercentSlider[0] / 100;
    setUnstakeLpAmount((MOCK_STAKED_LP_BALANCE * percent).toFixed(4));
  }, [unstakeLpPercentSlider]);

  const handleStakeLpAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) setStakeLpAmount(value);
  };

  const handleUnstakeLpPercentChange = (value: number[]) => {
    setUnstakeLpPercentSlider(value);
  };
  
  const handleMaxStake = () => {
    setStakeLpAmount(MOCK_LP_BALANCE.toString());
  };

  const handleClaimRewards = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    toast({
      title: 'Rewards Claimed!',
      description: `Successfully claimed ${MOCK_EARNED_PLATFORM_TOKENS.toLocaleString()} ${PLATFORM_TOKEN_SYMBOL}.`,
    });
    // TODO: Update earned tokens balance (MOCK_EARNED_PLATFORM_TOKENS = 0)
    setIsLoading(false);
  };

  const handleStakeLp = async () => {
    setIsLoading(true);
    const amount = parseFloat(stakeLpAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount of LP tokens to stake.', variant: 'destructive' });
      setIsLoading(false); return;
    }
    if (amount > MOCK_LP_BALANCE) {
      toast({ title: 'Insufficient LP Balance', description: 'You do not have enough LP tokens.', variant: 'destructive' });
      setIsLoading(false); return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    toast({ title: 'LP Tokens Staked!', description: `Successfully staked ${amount.toLocaleString()} LP tokens.` });
    // TODO: Update balances (MOCK_LP_BALANCE, MOCK_STAKED_LP_BALANCE)
    setStakeLpAmount('');
    setIsLoading(false);
  };

  const handleUnstakeLp = async () => {
    setIsLoading(true);
    const amount = parseFloat(unstakeLpAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Calculated unstake amount is invalid.', variant: 'destructive' });
      setIsLoading(false); return;
    }
    if (amount > MOCK_STAKED_LP_BALANCE) { // Should not happen with slider if MOCK_STAKED_LP_BALANCE is correct
      toast({ title: 'Insufficient Staked Balance', description: 'Cannot unstake more than currently staked.', variant: 'destructive' });
      setIsLoading(false); return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    toast({ title: 'LP Tokens Unstaked!', description: `Successfully unstaked ${amount.toLocaleString()} LP tokens.` });
    // TODO: Update balances (MOCK_STAKED_LP_BALANCE, MOCK_LP_BALANCE)
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 py-12 md:px-6">
      <Card className="shadow-lg w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            LP Token Staking Rewards
          </CardTitle>
          <CardDescription>
            Stake your NERO-stNERO LP tokens to earn <Badge variant="secondary">{PLATFORM_TOKEN_SYMBOL}</Badge> tokens. Maximize your yield!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard title="Your LP Balance" value={MOCK_LP_BALANCE.toLocaleString()} unit="LP" icon={Info} />
            <InfoCard title="Currently Staked" value={MOCK_STAKED_LP_BALANCE.toLocaleString()} unit="LP" icon={Info} />
            <InfoCard title="Est. APY" value={MOCK_LP_STAKING_APY.toFixed(1)} unit="%" icon={Percent} />
          </div>

          <Card className="bg-secondary/30 border-accent">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-accent" />
                Your Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xl font-semibold">
                {MOCK_EARNED_PLATFORM_TOKENS.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{PLATFORM_TOKEN_SYMBOL}</span>
              </p>
              <Button 
                onClick={handleClaimRewards} 
                disabled={isLoading || MOCK_EARNED_PLATFORM_TOKENS <= 0}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isLoading ? 'Claiming...' : `Claim ${PLATFORM_TOKEN_SYMBOL}`}
              </Button>
            </CardContent>
          </Card>

          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stake" className="flex items-center gap-1"><PlusCircle className="h-4 w-4" /> Stake LP Tokens</TabsTrigger>
              <TabsTrigger value="unstake" className="flex items-center gap-1"><MinusCircle className="h-4 w-4" /> Unstake LP Tokens</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stake" className="space-y-4 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="stake-lp-amount">Amount to Stake (LP Tokens)</Label>
                  <span className="text-sm text-muted-foreground">Balance: {MOCK_LP_BALANCE.toLocaleString()}</span>
                </div>
                <div className="relative">
                    <Input id="stake-lp-amount" type="text" placeholder="0.0" value={stakeLpAmount} onChange={handleStakeLpAmountChange} inputMode="decimal" className="pr-16" />
                    <Button variant="ghost" size="sm" onClick={handleMaxStake} className="absolute right-1 top-1/2 -translate-y-1/2 h-7">Max</Button>
                </div>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleStakeLp}
                disabled={isLoading || !parseFloat(stakeLpAmount) || parseFloat(stakeLpAmount) <=0}
              >
                {isLoading ? 'Staking...' : 'Stake LP Tokens'}
              </Button>
            </TabsContent>

            <TabsContent value="unstake" className="space-y-4 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="unstake-lp-percent">Amount to Unstake ({unstakeLpPercentSlider[0]}%)</Label>
                   <span className="text-sm text-muted-foreground">Staked: {MOCK_STAKED_LP_BALANCE.toLocaleString()} LP</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <Slider
                        id="unstake-lp-percent"
                        min={0}
                        max={100}
                        step={1}
                        value={unstakeLpPercentSlider}
                        onValueChange={handleUnstakeLpPercentChange}
                        className="w-full"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input type="text" readOnly value={`${unstakeLpAmount} LP Tokens`} className="bg-muted border-muted cursor-not-allowed mt-2" />
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleUnstakeLp}
                disabled={isLoading || parseFloat(unstakeLpAmount) <= 0}
              >
                {isLoading ? 'Unstaking...' : 'Unstake LP Tokens'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

    