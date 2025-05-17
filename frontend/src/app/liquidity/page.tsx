
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
import { Droplets, PlusCircle, MinusCircle, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';

// Mock data - replace with actual data fetching
const MOCK_NERO_BALANCE = 1000;
const MOCK_STNERO_BALANCE = 500;
const MOCK_LP_TOKEN_BALANCE = 100; // NERO-stNERO LP
const MOCK_NERO_PRICE_IN_STNERO_FOR_LP = 0.98; // 1 NERO = 0.98 stNERO in the pool
const MOCK_TOTAL_LP_SUPPLY = 10000; // Total LP tokens for the pool

export default function LiquidityPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Add Liquidity State
  const [addNeroAmount, setAddNeroAmount] = useState<string>('');
  const [addStNeroAmount, setAddStNeroAmount] = useState<string>('');
  const [estimatedLpReceived, setEstimatedLpReceived] = useState<string>('');

  // Remove Liquidity State
  const [removeLpPercent, setRemoveLpPercent] = useState<number[]>([50]); // Default to 50%
  const [removeLpAmount, setRemoveLpAmount] = useState<string>((MOCK_LP_TOKEN_BALANCE * 0.5).toFixed(4));
  const [estimatedNeroReceived, setEstimatedNeroReceived] = useState<string>('');
  const [estimatedStNeroReceived, setEstimatedStNeroReceived] = useState<string>('');


  // Effect for Add Liquidity: Calculate stNERO if NERO is entered, or vice-versa
  // This is a simplified calculation; real AMMs have more complex logic.
  useEffect(() => {
    const nero = parseFloat(addNeroAmount);
    if (!isNaN(nero) && nero > 0 && document.activeElement?.id === 'add-nero-amount') {
      setAddStNeroAmount((nero * MOCK_NERO_PRICE_IN_STNERO_FOR_LP).toFixed(4));
    }
  }, [addNeroAmount]);

  useEffect(() => {
    const stNero = parseFloat(addStNeroAmount);
    if (!isNaN(stNero) && stNero > 0 && document.activeElement?.id === 'add-stnero-amount') {
      setAddNeroAmount((stNero / MOCK_NERO_PRICE_IN_STNERO_FOR_LP).toFixed(4));
    }
  }, [addStNeroAmount]);
  
  // Effect for Add Liquidity: Estimate LP tokens
   useEffect(() => {
    const nero = parseFloat(addNeroAmount);
    const stNero = parseFloat(addStNeroAmount);
    if (!isNaN(nero) && nero > 0 && !isNaN(stNero) && stNero > 0) {
      // Super simplified LP token calculation: (neroAmount / totalNeroInPool) * totalLPSupply
      // This needs real pool data. For mock, let's assume a fixed ratio for simplicity.
      const mockLpRatio = MOCK_LP_TOKEN_BALANCE / (MOCK_NERO_BALANCE + MOCK_STNERO_BALANCE / MOCK_NERO_PRICE_IN_STNERO_FOR_LP);
      setEstimatedLpReceived((nero * mockLpRatio * 0.5).toFixed(4)); // Very rough estimate
    } else {
      setEstimatedLpReceived('');
    }
  }, [addNeroAmount, addStNeroAmount]);


  // Effect for Remove Liquidity: Calculate tokens from LP percentage
  useEffect(() => {
    const percent = removeLpPercent[0] / 100;
    const lpToRemove = MOCK_LP_TOKEN_BALANCE * percent;
    setRemoveLpAmount(lpToRemove.toFixed(4));
    // Simplified estimation of underlying tokens
    // This requires knowing the pool's current NERO and stNERO reserves
    // Mocking: Assume LP token represents a proportional share of (mocked) pool reserves
    const mockPoolNero = 50000; // Example total NERO in pool
    const mockPoolStNero = 49000; // Example total stNERO in pool
    setEstimatedNeroReceived(((lpToRemove / MOCK_TOTAL_LP_SUPPLY) * mockPoolNero).toFixed(4));
    setEstimatedStNeroReceived(((lpToRemove / MOCK_TOTAL_LP_SUPPLY) * mockPoolStNero).toFixed(4));
  }, [removeLpPercent]);


  const handleAddNeroAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) setAddNeroAmount(value);
  };
  const handleAddStNeroAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) setAddStNeroAmount(value);
  };
   const handleRemoveLpPercentChange = (value: number[]) => {
    setRemoveLpPercent(value);
  };

  const handleAddLiquidity = async () => {
    setIsLoading(true);
    const nero = parseFloat(addNeroAmount);
    const stNero = parseFloat(addStNeroAmount);

    if (isNaN(nero) || nero <= 0 || isNaN(stNero) || stNero <= 0) {
      toast({ title: 'Invalid Amounts', description: 'Please enter valid amounts for NERO and stNERO.', variant: 'destructive' });
      setIsLoading(false); return;
    }
    if (nero > MOCK_NERO_BALANCE || stNero > MOCK_STNERO_BALANCE) {
      toast({ title: 'Insufficient Balance', description: 'Check your NERO or stNERO balance.', variant: 'destructive' });
      setIsLoading(false); return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    toast({ title: 'Liquidity Added!', description: `Successfully added ${nero} NERO and ${stNero} stNERO. Received ~${estimatedLpReceived} LP tokens.` });
    // TODO: Update balances
    setIsLoading(false);
  };

  const handleRemoveLiquidity = async () => {
    setIsLoading(true);
    const lp = parseFloat(removeLpAmount);

    if (isNaN(lp) || lp <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid amount of LP tokens to remove.', variant: 'destructive' });
      setIsLoading(false); return;
    }
    if (lp > MOCK_LP_TOKEN_BALANCE) {
      toast({ title: 'Insufficient LP Balance', description: 'You do not have enough LP tokens.', variant: 'destructive' });
      setIsLoading(false); return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    toast({ title: 'Liquidity Removed!', description: `Successfully removed ${lp} LP tokens. Received ~${estimatedNeroReceived} NERO and ~${estimatedStNeroReceived} stNERO.` });
    // TODO: Update balances
    setIsLoading(false);
  };


  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-theme(spacing.28))] flex-col items-center justify-center px-4 md:px-6">
      <Card className="shadow-lg w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            Manage Liquidity
          </CardTitle>
          <CardDescription>
            Add or remove liquidity for the NERO/stNERO pool. Earn fees by providing liquidity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add" className="flex items-center gap-1"><PlusCircle className="h-4 w-4" /> Add Liquidity</TabsTrigger>
              <TabsTrigger value="remove" className="flex items-center gap-1"><MinusCircle className="h-4 w-4" /> Remove Liquidity</TabsTrigger>
            </TabsList>
            
            {/* Add Liquidity Tab */}
            <TabsContent value="add" className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="add-nero-amount">NERO Amount</Label>
                  <span className="text-sm text-muted-foreground">Balance: {MOCK_NERO_BALANCE.toLocaleString()}</span>
                </div>
                <Input id="add-nero-amount" type="text" placeholder="0.0" value={addNeroAmount} onChange={handleAddNeroAmountChange} inputMode="decimal" />
              </div>

              <div className="flex justify-center items-center text-muted-foreground">
                <PlusCircle className="h-5 w-5" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="add-stnero-amount">stNERO Amount</Label>
                  <span className="text-sm text-muted-foreground">Balance: {MOCK_STNERO_BALANCE.toLocaleString()}</span>
                </div>
                <Input id="add-stnero-amount" type="text" placeholder="0.0" value={addStNeroAmount} onChange={handleAddStNeroAmountChange} inputMode="decimal" />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Current Pool Rate: 1 NERO ≈ {MOCK_NERO_PRICE_IN_STNERO_FOR_LP.toFixed(4)} stNERO (Supplying at this rate)
              </p>
              
              {estimatedLpReceived && (
                <p className="text-sm font-medium text-center">
                  You will receive ≈ {estimatedLpReceived} LP Tokens
                </p>
              )}

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                onClick={handleAddLiquidity}
                disabled={isLoading || !parseFloat(addNeroAmount) || !parseFloat(addStNeroAmount)}
              >
                {isLoading ? 'Adding...' : 'Add Liquidity'}
              </Button>
            </TabsContent>

            {/* Remove Liquidity Tab */}
            <TabsContent value="remove" className="space-y-6 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <Label htmlFor="remove-lp-percent">Amount to Remove ({removeLpPercent[0]}%)</Label>
                   <span className="text-sm text-muted-foreground">LP Balance: {MOCK_LP_TOKEN_BALANCE.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Slider
                        id="remove-lp-percent"
                        min={0}
                        max={100}
                        step={1}
                        value={removeLpPercent}
                        onValueChange={handleRemoveLpPercentChange}
                        className="w-full"
                    />
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input type="text" readOnly value={`${removeLpAmount} LP Tokens`} className="bg-muted border-muted cursor-not-allowed mt-2" />
              </div>
              
              {parseFloat(estimatedNeroReceived) > 0 && parseFloat(estimatedStNeroReceived) > 0 && (
                <div className="border-t pt-4 mt-4 space-y-2">
                    <p className="text-sm font-medium">You will receive approximately:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground pl-2">
                        <li>{estimatedNeroReceived} NERO</li>
                        <li>{estimatedStNeroReceived} stNERO</li>
                    </ul>
                </div>
              )}

              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                onClick={handleRemoveLiquidity}
                disabled={isLoading || parseFloat(removeLpAmount) <= 0}
              >
                {isLoading ? 'Removing...' : 'Remove Liquidity'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
