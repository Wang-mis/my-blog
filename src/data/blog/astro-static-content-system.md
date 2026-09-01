---
title: 用 Astro 搭建一个快而简单的内容系统
description: 从内容集合、路由到部署，拆解一个零数据库博客的完整实现。
pubDate: 2026-09-01
updatedDate: 2026-09-01
topic: 前端开发
tags:
  - Astro
  - 内容系统
  - 静态站点
draft: false
featured: true
---

一个个人博客最重要的部分从来不是后台，而是内容能不能稳定地写、清楚地读、放心地迁移。如果站点只有一位作者，文章以长文为主，并不需要登录、协作审批或复杂权限，那么数据库和管理后台常常不是基础设施，而是额外负担。

Astro 很适合这种场景。文章保存在普通 Markdown 文件中，构建时生成静态页面，部署平台只负责分发文件。内容、代码和版本历史都在同一个仓库里，任何一层都可以独立替换。

> **设计原则**：内容即代码，结构清晰，随版本演进，部署可回滚。

这篇文章会从需求边界开始，逐步建立内容集合、文章路由、专题与订阅源，最后把站点交给 Vercel 自动发布。

## 为什么选择静态内容

静态站点不等于功能简单。它只是把能够提前完成的工作放到构建阶段：读取文章、验证元数据、生成页面、建立索引。访问者拿到的是已经生成好的 HTML、CSS 和少量必要脚本，因此首屏快、缓存友好，也没有数据库连接失败或服务端运行时升级带来的风险。

对于个人技术博客，静态内容有四个直接收益：

1. **可迁移**：Markdown 是普通文本，不绑定特定平台。
2. **可审查**：文章和代码一起进入版本历史，任何修改都有差异记录。
3. **可验证**：构建前就能发现标题缺失、日期错误或专题名称拼错。
4. **可回滚**：一次发布出现问题时，回到上一个提交即可恢复整个站点。

它的边界也很明确。多人实时协作、细粒度权限、海量动态筛选或需要频繁更新的业务数据，更适合由 CMS 或数据库承载。不要因为“静态更快”就把所有产品都做成静态站点；这里选择 Astro，是因为它与博客的真实工作流匹配。

## 建立内容集合

内容集合解决的第一个问题不是“从哪里读取文件”，而是“什么才算一篇有效文章”。标题、摘要、发布日期、专题、标签和发布状态都应该有明确类型。这样，页面组件可以信任收到的数据，RSS 与 sitemap 也不会在上线后才暴露缺失字段。

现代 Astro 使用 Content Layer API。我们通过 `glob()` loader 读取 `src/data/blog` 下的 Markdown，并用 Schema 描述 Frontmatter：

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    topic: z.enum(['AI 工程', '前端开发', '效率工具']),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});
```

这里有两个值得注意的选择。日期使用 `z.coerce.date()`，让 YAML 中直观的日期写法最终变成真正的 `Date`；专题使用枚举而不是自由字符串，避免“前端”“前端开发”“Frontend”同时出现，导致列表被意外拆散。

文章正文不需要另建字段。Astro 会保留 Markdown 内容，并在页面中通过 `render()` 转换成可渲染组件。文章文件名会成为稳定 id，因此 `astro-static-content-system.md` 可以自然对应 `/articles/astro-static-content-system/`。

## 生成文章路由

静态动态路由听起来矛盾，其实只是“根据数据批量生成页面”。构建时先取得全部已发布文章，再为每一篇返回一个路径参数：

```ts
const posts = await getCollection('blog');
posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post, posts },
  }));
}
```

把完整文章列表一起传入页面，是为了计算上一篇与下一篇。这个关系必须使用与文章列表完全相同的排序和草稿过滤规则，否则归档里看不到的草稿可能通过上下篇导航泄露。

同样的单一数据源还可以派生：首页精选、最新文章、专题数量、搜索索引、RSS 与 sitemap。不要为每个页面维护一份文章数组；一旦顺序或过滤条件不同步，读者会在不同入口看到互相矛盾的站点。

### 阅读时长与目录

阅读时长可以根据中日韩字符数和拉丁单词数粗略计算。它不需要假装非常精确，只要规则稳定、结果可信即可。目录则直接使用 Astro 渲染文章时返回的标题数组，并限制到二级和三级标题。

宽屏页面可以把目录放在正文右侧并保持粘性；移动端屏幕有限，应该折叠成原生 `<details>` 控件。目录链接需要留出 `scroll-margin-top`，否则点击后标题会贴在视口顶部，阅读体验很突兀。

## 部署与持续发布

Astro 默认输出静态文件。把仓库导入 Vercel 后，平台会自动识别框架、安装依赖并执行构建。之后每次推送都会产生预览部署，主分支更新则发布到生产环境。

真正需要单独配置的是站点公开地址。canonical、RSS 和 sitemap 都依赖绝对 URL，因此用 `SITE_URL` 环境变量提供 Vercel 地址或自定义域名。开发环境可以回退到 `http://localhost:4321`，但生产环境必须使用读者真实访问的地址。

发布流程最好保持朴素：

1. 新建 Markdown，填写 Frontmatter，并保持 `draft: true`。
2. 本地运行检查和预览，确认标题层级、代码块与链接。
3. 将 `draft` 改为 `false`，提交到仓库。
4. 等待 Vercel 构建完成，再检查线上 RSS 与 canonical。

静态博客真正的优势不是少用一台服务器，而是把内容生命周期变得透明。每篇文章都是一个可以审查、测试、发布和回滚的变更。技术选择只有服务于这个流程时才有价值。
