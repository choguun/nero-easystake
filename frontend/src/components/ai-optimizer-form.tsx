"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { suggestStakingStrategy } from "@/ai/flows/suggest-staking-strategy";
import type { SuggestStakingStrategyOutput } from "@/ai/flows/suggest-staking-strategy";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  riskProfile: z.enum(["low", "medium", "high"], {
    required_error: "Please select a risk profile.",
  }),
});

type FormData = z.infer<typeof FormSchema>;

export default function AiOptimizerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestStakingStrategyOutput | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    console.log("Submitting data:", data); // Log input data

    try {
      const suggestion = await suggestStakingStrategy(data);
      console.log("AI Suggestion:", suggestion); // Log AI response
      setResult(suggestion);
      toast({
        title: "Strategy Generated!",
        description: "AI has suggested an optimal staking strategy.",
      });
    } catch (err) {
      console.error("Error fetching AI suggestion:", err); // Log error
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
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
    <Card className="w-full shadow-lg border border-border" data-oid="q6b5_m6">
      <CardHeader data-oid="rnt064o">
        <CardTitle
          className="text-2xl flex items-center gap-2"
          data-oid="ijf:.9h"
        >
          <Sparkles className="h-6 w-6 text-accent" data-oid="b8:39.z" />
          AI Strategy Optimizer
        </CardTitle>
        <CardDescription data-oid=":48wdqj">
          Select your risk appetite and let our AI recommend the best staking
          approach for you on the NERO chain.
        </CardDescription>
      </CardHeader>
      <CardContent data-oid="23v7kqz">
        <Form {...form} data-oid="2z77wz5">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            data-oid="-v7::ci"
          >
            <FormField
              control={form.control}
              name="riskProfile"
              render={({ field }) => (
                <FormItem data-oid="nfkhdtu">
                  <FormLabel data-oid="uqll6r.">Risk Profile</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    data-oid="3dk5-jj"
                  >
                    <FormControl data-oid="w2:lvgp">
                      <SelectTrigger data-oid=".fhe2if">
                        <SelectValue
                          placeholder="Select your risk tolerance"
                          data-oid="c0k9vqd"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent data-oid=":.hg_1k">
                      <SelectItem value="low" data-oid="zl2wz9l">
                        Low Risk
                      </SelectItem>
                      <SelectItem value="medium" data-oid="-03ixfk">
                        Medium Risk
                      </SelectItem>
                      <SelectItem value="high" data-oid="f5tm02.">
                        High Risk
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription data-oid="4jwq:.0">
                    Choose the level of risk you are comfortable with for your
                    staking activities.
                  </FormDescription>
                  <FormMessage data-oid="vg:jjs3" />
                </FormItem>
              )}
              data-oid="tzd5lhp"
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              data-oid="2gi4a0t"
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="mr-2 h-4 w-4 animate-spin"
                    data-oid="w5o3oog"
                  />
                  Generating Strategy...
                </>
              ) : (
                "Get AI Suggestion"
              )}
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-6" data-oid="25p.rgo">
            <AlertTitle data-oid="bzc_3z0">Error</AlertTitle>
            <AlertDescription data-oid="-on25cn">{error}</AlertDescription>
          </Alert>
        )}

        {result && !error && (
          <Card
            className="mt-6 bg-secondary/50 border-accent"
            data-oid="a0xbusa"
          >
            <CardHeader data-oid="bqr86bz">
              <CardTitle
                className="text-lg flex items-center gap-2"
                data-oid="mol1zm."
              >
                <Sparkles className="h-5 w-5 text-accent" data-oid="pn.3pcj" />
                AI Recommended Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2" data-oid="a9omp:n">
              <p data-oid="vvctgnx">
                <strong data-oid="pj_4ybn">Strategy:</strong> {result.strategy}
              </p>
              <p data-oid="rn:szpe">
                <strong data-oid="kxzq8bm">Reasoning:</strong> {result.reason}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
