'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { suggestStakingStrategy } from '@/ai/flows/suggest-staking-strategy';
import type { SuggestStakingStrategyOutput } from '@/ai/flows/suggest-staking-strategy';
import { useToast } from '@/hooks/use-toast';


const FormSchema = z.object({
  riskProfile: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a risk profile.',
  }),
});

type FormData = z.infer<typeof FormSchema>;

export default function AiOptimizerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestStakingStrategyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

 async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    console.log('Submitting data:', data); // Log input data

    try {
      const suggestion = await suggestStakingStrategy(data);
       console.log('AI Suggestion:', suggestion); // Log AI response
      setResult(suggestion);
       toast({
        title: "Strategy Generated!",
        description: "AI has suggested an optimal staking strategy.",
      });
    } catch (err) {
      console.error('Error fetching AI suggestion:', err); // Log error
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Failed to get suggestion: ${errorMessage}`);
       toast({
        title: "Error",
        description: `Failed to get suggestion: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg border border-border">
        <CardHeader>
             <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                 AI Strategy Optimizer
            </CardTitle>
            <CardDescription>
                Select your risk appetite and let our AI recommend the best staking approach for you on the NERO chain.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                control={form.control}
                name="riskProfile"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Risk Profile</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your risk tolerance" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormDescription>
                        Choose the level of risk you are comfortable with for your staking activities.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Strategy...
                    </>
                ) : (
                    'Get AI Suggestion'
                )}
                </Button>
            </form>
            </Form>

             {error && (
            <Alert variant="destructive" className="mt-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}

            {result && !error && (
                 <Card className="mt-6 bg-secondary/50 border-accent">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-accent" />
                            AI Recommended Strategy
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Strategy:</strong> {result.strategy}</p>
                        <p><strong>Reasoning:</strong> {result.reason}</p>
                    </CardContent>
                </Card>
            )}

        </CardContent>
    </Card>
  );
}
