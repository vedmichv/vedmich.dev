import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const speaking = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/speaking' }),
  schema: z.object({
    title: z.string(),
    event: z.string(),
    city: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    video: z.string().url().optional(),
    slides: z.string().url().optional(),
    rating: z.string().optional(),
    highlight: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, speaking };
