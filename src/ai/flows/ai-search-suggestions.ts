'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing smart search suggestions.
 *
 * The flow takes a search query as input and returns a list of suggested search terms.
 * It uses a language model to generate relevant and helpful suggestions based on the input query.
 *
 * @interface AISearchSuggestionsInput - The input type for the smartSearchSuggestions function.
 * @interface AISearchSuggestionsOutput - The output type for the smartSearchSuggestions function, containing an array of suggestions.
 * @function smartSearchSuggestions - The main function to generate smart search suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISearchSuggestionsInputSchema = z.object({
  query: z.string().describe('The current search query.'),
});
export type AISearchSuggestionsInput = z.infer<typeof AISearchSuggestionsInputSchema>;

const AISearchSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested search terms.'),
});
export type AISearchSuggestionsOutput = z.infer<typeof AISearchSuggestionsOutputSchema>;

export async function smartSearchSuggestions(input: AISearchSuggestionsInput): Promise<AISearchSuggestionsOutput> {
  return smartSearchSuggestionsFlow(input);
}

const smartSearchSuggestionsPrompt = ai.definePrompt({
  name: 'smartSearchSuggestionsPrompt',
  input: {schema: AISearchSuggestionsInputSchema},
  output: {schema: AISearchSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides smart search suggestions for a video streaming app.
  Given the current search query, generate an array of suggested search terms that are relevant and helpful to the user.
  The suggestions should help the user find the content they are looking for.

  Current search query: {{{query}}}

  Format your response as a JSON object with a "suggestions" array.
  Example: {{"suggestions": ["suggestion1", "suggestion2", "suggestion3"]}}`,
});

const smartSearchSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartSearchSuggestionsFlow',
    inputSchema: AISearchSuggestionsInputSchema,
    outputSchema: AISearchSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await smartSearchSuggestionsPrompt(input);
    return output!;
  }
);
