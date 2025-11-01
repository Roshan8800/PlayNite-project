import { config } from 'dotenv';
config();

import '@/ai/flows/ai-search-suggestions.ts';
import '@/ai/flows/content-recommendation-engine.ts';
import '@/ai/flows/ai-content-moderation.ts';
import '@/ai/flows/ai-tag-generation.ts';
import '@/ai/flows/content-summarization.ts';