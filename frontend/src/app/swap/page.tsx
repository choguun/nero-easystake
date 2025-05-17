
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
import { ArrowRightLeft, Coins, Repeat2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual data fetching and contract interactions
const MOCK_NERO_BALANCE = 1000;
const MOCK_STNERO_BALANCE = 500;
const MOCK_NERO_TO_STNERO_RATE = 0.98; // 1 NERO = 0.98 stNERO
const MOCK_STNERO_TO_NERO_RATE = 1 / 0.98; // 1 stNERO = 1.02 NERO

type Token = 'NERO' | 'stNERO';

export default function SwapPage() {
  const [fromToken, setFromToken] = useState<Token>('NERO');
  const [toToken, setToToken] = useState<Token>('stNERO');
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmountEstimate, setToAmountEstimate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fromTokenBalance = fromToken === 'NERO' ? MOCK_NERO_BALANCE : MOCK_STNERO_BALANCE;
  const toTokenBalance = toToken === 'NERO' ? MOCK_NERO_BALANCE : MOCK_STNERO_BALANCE;
  const exchangeRate = fromToken === 'NERO' ? MOCK_NERO_TO_STNERO_RATE : MOCK_STNERO_TO_NERO_RATE;

  useEffect(() => {
    const amount = parseFloat(fromAmount);
    if (!isNaN(amount) && amount > 0) {
      setToAmountEstimate((amount * exchangeRate).toFixed(4));
    } else {
      setToAmountEstimate('');
    }
  }, [fromAmount, exchangeRate]);

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleMaxClick = () => {
    const balanceStr = fromTokenBalance.toString();
    setFromAmount(balanceStr);
  };

  const handleSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    // Optionally, clear amounts or try to convert 'toAmountEstimate' back to 'fromAmount'
    setFromAmount(''); 
    setToAmountEstimate('');
  };

  const handleSwap = async () => {
    setIsLoading(true);
    const amountToSwap = parseFloat(fromAmount);

    if (isNaN(amountToSwap) || amountToSwap <= 0) {
      toast({
        title: 'Invalid Amount',
        description: `Please enter a valid amount of ${fromToken} to swap.`,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (amountToSwap > fromTokenBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You do not have enough ${fromToken} to swap this amount.`,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    // Simulate swapping process
    console.log(`Swapping ${amountToSwap} ${fromToken} for ${toToken}...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    toast({
      title: 'Swap Successful!',
      description: `You successfully swapped ${amountToSwap} ${fromToken} for approximately ${toAmountEstimate} ${toToken}.`,
    });

    // TODO: Update user balances after successful swap (this is mock)
    // For example:
    // if (fromToken === 'NERO') {
    //   MOCK_NERO_BALANCE -= amountToSwap;
    //   MOCK_STNERO_BALANCE += parseFloat(toAmountEstimate);
    // } else {
    //   MOCK_STNERO_BALANCE -= amountToSwap;
    //   MOCK_NERO_BALANCE += parseFloat(toAmountEstimate);
    // }
    // setFromAmount(''); // Optionally reset form

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 md:px-6">
      <Card className="shadow-lg w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Repeat2 className="h-6 w-6 text-primary" />
            Swap Tokens
          </CardTitle>
          <CardDescription>
            Exchange {fromToken} for {toToken} seamlessly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Token Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label htmlFor="from-amount">From: {fromToken}</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {fromTokenBalance.toLocaleString()}
              </span>
            </div>
            <div className="relative">
              <Input
                id="from-amount"
                type="text"
                placeholder="0.0"
                value={fromAmount}
                onChange={handleAmountChange}
                className="pr-16 text-lg"
                inputMode="decimal"
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

          {/* Switch Button */}
          <div className="flex justify-center">
            <Button variant="outline" size="icon" onClick={handleSwitchTokens} aria-label="Switch tokens">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </Button>
          </div>

          {/* To Token Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <Label htmlFor="to-amount">To: {toToken}</Label>
               <span className="text-sm text-muted-foreground">
                Balance: {toTokenBalance.toLocaleString()}
              </span>
            </div>
            <Input
              id="to-amount"
              type="text"
              readOnly
              placeholder="0.0"
              value={toAmountEstimate ? `≈ ${toAmountEstimate}` : '0.0'}
              className="bg-muted border-muted cursor-not-allowed text-lg"
            />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            1 {fromToken} ≈ {exchangeRate.toFixed(4)} {toToken} (Rate may vary)
          </p>

        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleSwap}
            disabled={isLoading || parseFloat(fromAmount) <= 0 || isNaN(parseFloat(fromAmount))}
          >
            {isLoading ? 'Swapping...' : `Swap ${fromToken}`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
