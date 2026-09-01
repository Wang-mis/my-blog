import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getFeaturedPost(posts: BlogPost[]) {
  return posts.find((post) => post.data.featured) ?? posts[0];
}

export function getPostUrl(post: BlogPost) {
  return `/articles/${post.id}/`;
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function readingMinutes(body = '') {
  const plain = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_\-[\]()]/g, ' ');
  const cjkCount = (plain.match(/[\u3400-\u9fff]/g) ?? []).length;
  const latinCount = (plain.match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.ceil(cjkCount / 200 + latinCount / 180));
}

export function getAdjacentPosts(posts: BlogPost[], currentId: string) {
  const index = posts.findIndex((post) => post.id === currentId);
  return {
    newer: index > 0 ? posts[index - 1] : undefined,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : undefined,
  };
}
