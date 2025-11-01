'use server';

/**
 * @fileOverview Provides content summarization for videos.
 *
 * - summarizeContent - A function that generates a brief summary of a video.
 * - ContentSummarizationInput - The input type for the summarizeContent function.
 * - ContentSummarizationOutput - The return type for the summarizeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentSummarizationInputSchema = z.object({
  videoTitle: z.string().describe('The title of the video.'),
  videoDescription: z.string().describe('The description of the video.'),
});

export type ContentSummarizationInput = z.infer<typeof ContentSummarizationInputSchema>;

const ContentSummarizationOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the video content.'),
});

export type ContentSummarizationOutput = z.infer<typeof ContentSummarizationOutputSchema>;

export async function summarizeContent(input: ContentSummarizationInput): Promise<ContentSummarizationOutput> {
  return summarizeContentFlow(input);
}

const summarizeContentPrompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {schema: ContentSummarizationInputSchema},
  output: {schema: ContentSummarizationOutputSchema},
  prompt: `Provide a brief summary of the video content based on the following information:\n\nTitle: {{{videoTitle}}}\nDescription: {{{videoDescription}}}\n\nSummary:`,
});

const summarizeContentFlow = ai.defineFlow(
  {
    name: 'summarizeContentFlow',
    inputSchema: ContentSummarizationInputSchema,
    outputSchema: ContentSummarizationOutputSchema,
  },
  async input => {
    const {output} = await summarizeContentPrompt(input);
    return output!;
  }
);
