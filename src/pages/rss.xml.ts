import rss from '@astrojs/rss';
import { SITE } from '../config';
import { getPostUrl, getPublishedPosts } from '../lib/posts';

export async function GET(context: { site: URL | undefined }) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? new URL('http://localhost:4321'),
    customData: '<language>zh-CN</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: getPostUrl(post),
      categories: [post.data.topic, ...post.data.tags],
    })),
  });
}
