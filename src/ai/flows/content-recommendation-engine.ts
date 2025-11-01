'use server';

/**
 * @fileOverview An AI-powered content recommendation engine.
 *
 * - contentRecommendationEngine - A function that suggests videos based on viewing history and preferences.
 * - ContentRecommendationEngineInput - The input type for the contentRecommendationEngine function.
 * - ContentRecommendationEngineOutput - The return type for the contentRecommendationEngine function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentRecommendationEngineInputSchema = z.object({
  viewingHistory: z
    .array(z.string())
    .describe('An array of video IDs representing the user viewing history.'),
  userPreferences: z
    .string()
    .describe('A string describing the user preferences for video content.'),
});
export type ContentRecommendationEngineInput =
  z.infer<typeof ContentRecommendationEngineInputSchema>;

const ContentRecommendationEngineOutputSchema = z.object({
  recommendedVideos: z
    .array(z.string())
    .describe('An array of video IDs representing the recommended videos.'),
});
export type ContentRecommendationEngineOutput =
  z.infer<typeof ContentRecommendationEngineOutputSchema>;

export async function contentRecommendationEngine(
  input: ContentRecommendationEngineInput
): Promise<ContentRecommendationEngineOutput> {
  return contentRecommendationEngineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentRecommendationEnginePrompt',
  input: {schema: ContentRecommendationEngineInputSchema},
  output: {schema: ContentRecommendationEngineOutputSchema},
  prompt: `You are an expert video recommendation engine.

Based on the user's viewing history and preferences, you will recommend a list of video IDs.

User Viewing History: {{{viewingHistory}}}
User Preferences: {{{userPreferences}}}

Recommended Videos:`, // Removed JSON wrapping because the model already produces valid JSON.
});

const contentRecommendationEngineFlow = ai.defineFlow(
  {
    name: 'contentRecommendationEngineFlow',
    inputSchema: ContentRecommendationEngineInputSchema,
    outputSchema: ContentRecommendationEngineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
