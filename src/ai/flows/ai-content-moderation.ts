'use server';

/**
 * @fileOverview AI-powered content moderation flow.
 *
 * - moderateContent - A function that moderates the video content.
 * - ModerateContentInput - The input type for the moderateContent function.
 * - ModerateContentOutput - The return type for the moderateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateContentInputSchema = z.object({
  title: z.string().describe('The title of the video.'),
  description: z.string().describe('The description of the video.'),
  videoUrl: z.string().describe('The URL of the video.'),
});
export type ModerateContentInput = z.infer<typeof ModerateContentInputSchema>;

const ModerateContentOutputSchema = z.object({
  isAppropriate: z.boolean().describe('Whether the content is appropriate or not.'),
  reason: z.string().describe('The reason why the content is inappropriate, if any.'),
});
export type ModerateContentOutput = z.infer<typeof ModerateContentOutputSchema>;

export async function moderateContent(input: ModerateContentInput): Promise<ModerateContentOutput> {
  return moderateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moderateContentPrompt',
  input: {schema: ModerateContentInputSchema},
  output: {schema: ModerateContentOutputSchema},
  prompt: `You are an AI content moderator. Your task is to determine if the video content is appropriate based on the title, description and video URL.

Title: {{{title}}}
Description: {{{description}}}
Video URL: {{{videoUrl}}}

Respond in a JSON format. The isAppropriate field should be true if the content is appropriate, and false otherwise. If the content is inappropriate, the reason field should contain a detailed explanation.

Consider these categories when moderating the content:
- Hate speech
- Sexually explicit content
- Harassment
- Dangerous content
- Promotion of violence
- Illegal activities
- Spam
`,
});

const moderateContentFlow = ai.defineFlow(
  {
    name: 'moderateContentFlow',
    inputSchema: ModerateContentInputSchema,
    outputSchema: ModerateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
