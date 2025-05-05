'use server';

/**
 * @fileOverview An AI agent that suggests optimal staking strategies based on user risk profile and network conditions.
 *
 * - suggestStakingStrategy - A function that handles the staking strategy suggestion process.
 * - SuggestStakingStrategyInput - The input type for the suggestStakingStrategy function.
 * - SuggestStakingStrategyOutput - The return type for the suggestStakingStrategy function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getNetworkConditions, getStakingRewards} from '@/services/nero-chain';

const SuggestStakingStrategyInputSchema = z.object({
  riskProfile: z
    .enum(['low', 'medium', 'high'])
    .describe('The user risk profile: low, medium, or high.'),
});
export type SuggestStakingStrategyInput = z.infer<typeof SuggestStakingStrategyInputSchema>;

const SuggestStakingStrategyOutputSchema = z.object({
  strategy: z.string().describe('The suggested staking strategy.'),
  reason: z.string().describe('The reasoning behind the suggested strategy.'),
});
export type SuggestStakingStrategyOutput = z.infer<typeof SuggestStakingStrategyOutputSchema>;

export async function suggestStakingStrategy(input: SuggestStakingStrategyInput): Promise<SuggestStakingStrategyOutput> {
  return suggestStakingStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestStakingStrategyPrompt',
  input: {
    schema: z.object({
      riskProfile: z
        .enum(['low', 'medium', 'high'])
        .describe('The user risk profile: low, medium, or high.'),
      apy: z.number().describe('The current staking APY.'),
      blockHeight: z.number().describe('The current block height.'),
    }),
  },
  output: {
    schema: z.object({
      strategy: z.string().describe('The suggested staking strategy.'),
      reason: z.string().describe('The reasoning behind the suggested strategy.'),
    }),
  },
  prompt: `You are an AI assistant that suggests optimal staking strategies based on user risk profile and current network conditions.

  Based on the current staking APY of {{apy}} and the current block height of {{blockHeight}}, and the user's risk profile of {{riskProfile}}, suggest a staking strategy.

  Consider the following:
  - Low risk profile: Suggest a conservative strategy with lower but more stable rewards.
  - Medium risk profile: Suggest a balanced strategy with moderate rewards and risk.
  - High risk profile: Suggest an aggressive strategy with higher potential rewards but also higher risk.

  Provide a brief reason for your suggestion.
  `,
});

const suggestStakingStrategyFlow = ai.defineFlow<
  typeof SuggestStakingStrategyInputSchema,
  typeof SuggestStakingStrategyOutputSchema
>(
  {
    name: 'suggestStakingStrategyFlow',
    inputSchema: SuggestStakingStrategyInputSchema,
    outputSchema: SuggestStakingStrategyOutputSchema,
  },
  async input => {
    const {apy} = await getStakingRewards();
    const {blockHeight} = await getNetworkConditions();
    const {output} = await prompt({
      ...input,
      apy,
      blockHeight,
    });
    return output!;
  }
);

