export const SITE = {
  name: 'my-blog',
  title: 'my-blog｜AI、工程实践与产品思考',
  description: '关于 AI、工程实践与产品思考的长期笔记。',
  author: 'my-blog',
  locale: 'zh-CN',
  heroTitle: '把复杂技术，写成清晰答案',
  heroDescription: '记录 AI、工程实践与产品思考。持续发布可复用的深度笔记与 AI 日报。',
} as const;

export const TOPICS = [
  { name: 'AI 工程', slug: 'ai-engineering' },
  { name: '前端开发', slug: 'frontend-development' },
  { name: '效率工具', slug: 'productivity' },
  { name: 'AI 日报', slug: 'ai-daily' },
] as const;

export type TopicName = (typeof TOPICS)[number]['name'];

export function getTopicSlug(topic: string) {
  return TOPICS.find((item) => item.name === topic)?.slug ?? 'articles';
}
