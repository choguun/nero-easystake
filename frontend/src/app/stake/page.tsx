'use client';

import { useState, ChangeEvent } from 'react';
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
import { Wallet, ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual data fetching
const MOCK_NERO_BALANCE = 1000;
const MOCK_STNERO_BALANCE = 50.5;
const MOCK_EXCHANGE_RATE = 0.98; // 1 NERO = 0.98 stNERO

export default function StakePage() {
  const [neroAmount, setNeroAmount] = useState<string>('');
  const [stNeroEstimate, setStNeroEstimate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setNeroAmount(value);
      const amount = parseFloat(value);
      if (!isNaN(amount) && amount > 0) {
        setStNeroEstimate(amount * MOCK_EXCHANGE_RATE);
      } else {
        setStNeroEstimate(0);
      }
    }
  };

  const handleMaxClick = () => {
    const balanceStr = MOCK_NERO_BALANCE.toString();
    setNeroAmount(balanceStr);
    setStNeroEstimate(MOCK_NERO_BALANCE * MOCK_EXCHANGE_RATE);
  };

 const handleStake = async () => {
    setIsLoading(true);
    const amountToStake = parseFloat(neroAmount);

    if (isNaN(amountToStake) || amountToStake <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount of NERO to stake.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (amountToStake > MOCK_NERO_BALANCE) {
       toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough NERO to stake this amount.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Simulate staking process
    console.log(`Staking ${amountToStake} NERO...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    // TODO: Replace with actual staking logic (API call, wallet interaction)

     toast({
      title: 'Staking Successful!',
      description: `You successfully staked ${amountToStake} NERO and received approximately ${stNeroEstimate.toFixed(4)} stNERO.`,
    });

    // Reset form (optional, depends on UX preference)
    // setNeroAmount('');
    // setStNeroEstimate(0);

    // TODO: Update user balances after successful staking
    // MOCK_NERO_BALANCE -= amountToStake;
    // MOCK_STNERO_BALANCE += stNeroEstimate;

    setIsLoading(false);
  };


  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 md:px-6">
      <Card className="shadow-lg w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
             <ArrowRightLeft className="h-6 w-6 text-primary" />
            Stake NERO, Get stNERO
          </CardTitle>
          <CardDescription>
            Stake your native NERO tokens to receive stNERO Liquid Staking Tokens and start earning rewards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label htmlFor="nero-amount">Amount to Stake (NERO)</Label>
               <span className="text-sm text-muted-foreground">
                 Balance: {MOCK_NERO_BALANCE.toLocaleString()} NERO
               </span>
            </div>
            <div className="relative">
              <Input
                id="nero-amount"
                type="text" // Use text to allow finer control over input format
                placeholder="0.0"
                value={neroAmount}
                onChange={handleAmountChange}
                className="pr-16" // Add padding for the "Max" button
                inputMode="decimal" // Hint for mobile keyboards
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
              >
                Max
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center text-muted-foreground">
             <ArrowRightLeft className="h-4 w-4 mx-2" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stnero-estimate">Estimated stNERO Received</Label>
            <Input
              id="stnero-estimate"
              type="text"
              readOnly
              value={stNeroEstimate > 0 ? `≈ ${stNeroEstimate.toFixed(4)}` : '0.0'}
              className="bg-muted border-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Exchange Rate: 1 NERO ≈ {MOCK_EXCHANGE_RATE} stNERO (Rate may vary slightly)
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
             <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                Your stNERO Balance: {MOCK_STNERO_BALANCE.toLocaleString()} stNERO
            </p>
          </div>

        </CardContent>
        <CardFooter>
          <Button
             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
             onClick={handleStake}
             disabled={isLoading || parseFloat(neroAmount) <= 0 || isNaN(parseFloat(neroAmount))}
          >
             {isLoading ? 'Staking...' : 'Stake NERO'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
