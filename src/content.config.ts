import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
    author: z.string().default('Viktor Vedmich'),
    reading_time: z.number().optional(),
    cover_image: z.string().optional(),
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

const presentations = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/presentations' }),
  schema: z.object({
    title: z.string(),
    event: z.string(),
    city: z.string().nullable(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()),
    slides: z.string().url().optional(),
    video: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, speaking, presentations };
