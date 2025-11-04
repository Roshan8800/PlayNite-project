'use server';

/**
 * @fileOverview Automatically generates tags for videos to improve searchability.
 *
 * - generateTags - A function that generates tags for a video.
 * - GenerateTagsInput - The input type for the generateTags function.
 * - GenerateTagsOutput - The return type for the generateTags function.
 */

import {z} from 'zod';

const GenerateTagsInputSchema = z.object({
  videoTitle: z.string().describe('The title of the video.'),
  videoDescription: z.string().describe('The description of the video.'),
});

export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;

const GenerateTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of tags for the video.'),
});

export type GenerateTagsOutput = z.infer<typeof GenerateTagsOutputSchema>;

export async function generateTags(input: GenerateTagsInput): Promise<GenerateTagsOutput> {
  // TODO: Re-implement AI tag generation without genkit
  // For now, return basic tags based on title keywords
  const titleWords = input.videoTitle.toLowerCase().split(/\s+/);
  const descriptionWords = input.videoDescription.toLowerCase().split(/\s+/);

  const allWords = [...titleWords, ...descriptionWords];
  const tags = allWords
    .filter(word => word.length > 3)
    .slice(0, 10)
    .map(word => word.replace(/[^\w]/g, ''));

  return { tags };
}
