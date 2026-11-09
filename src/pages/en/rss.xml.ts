import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { feedOptions } from '../../lib/feed';

export async function GET({ site }: APIContext) {
  return rss(feedOptions('en', await getCollection('blog'), site!));
}
