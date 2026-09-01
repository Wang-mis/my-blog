# my-blog

一个使用 Astro 构建的中文技术博客。站点以 Markdown 文件作为内容源，在构建阶段生成静态 HTML，可直接部署到 Vercel，不需要数据库、CMS 或服务器端运行时。

## 功能

- 首页精选、最新文章和专题入口
- 文章列表与本地搜索
- Markdown 文章详情、桌面粘性目录和移动折叠目录
- 专题、归档、上一篇/下一篇
- RSS、sitemap、robots、canonical、Open Graph 与文章 JSON-LD
- 响应式导航、键盘焦点和减少动态效果支持

## 环境要求

- Node.js 22.12 或更高版本
- npm 10 或更高版本

## 本地运行

```bash
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

常用命令：

```bash
npm run check    # Astro 和 TypeScript 检查
npm run build    # 检查并生成 dist/
npm run preview  # 预览生产构建
```

## 写一篇文章

在 `src/data/blog/` 下新建 Markdown 文件，文件名会成为文章 URL，例如：

```text
src/data/blog/my-new-post.md
→ /articles/my-new-post/
```

Frontmatter 格式：

```yaml
---
title: 文章标题
description: 用于列表、搜索、RSS 和 SEO 的简短摘要
pubDate: 2026-09-01
updatedDate: 2026-09-02 # 可选
topic: AI 工程 # AI 工程 | 前端开发 | 效率工具
tags:
  - Agent
  - 工具调用
draft: true
featured: false
---
```

- `draft: true` 的文章不会进入公开页面、搜索、RSS、sitemap 或上下篇导航。
- `featured: true` 用于首页精选；如果多篇文章被标记，选择发布时间最新的一篇。
- 阅读时长根据正文中的中文字符和拉丁单词自动估算。
- 二级和三级 Markdown 标题会生成文章目录。

完成文章后运行 `npm run build`。确认构建通过，再把 `draft` 改为 `false` 并提交。

## 站点配置

品牌名称、描述、首页文案和专题 URL 位于 `src/config.ts`。全局颜色、字体、间距和响应式规则位于 `src/styles/global.css`。

复制环境变量示例：

```bash
cp .env.example .env
```

然后把 `SITE_URL` 改成站点的公开地址：

```dotenv
SITE_URL=https://your-project.vercel.app
```

这个值用于 canonical、RSS、robots 和 sitemap。绑定自定义域名后，需要同时更新 Vercel 环境变量并重新部署。

如需展示自己的 GitHub 地址，请修改 `src/components/Footer.astro` 中的 GitHub 链接。

## 部署到 Vercel

1. 把项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 中导入仓库。
3. Framework Preset 选择 Astro；通常 Vercel 会自动识别。
4. 添加环境变量 `SITE_URL`，值为实际的 Vercel 地址或自定义域名。
5. 执行部署。

构建命令为 `npm run build`，输出目录为 `dist`。之后向生产分支推送即可自动构建并发布。

## RSS 与站点地图

- RSS：`/rss.xml`
- Sitemap 索引：`/sitemap-index.xml`
- Robots：`/robots.txt`

RSS 包含所有已发布文章的标题、摘要、专题和标签。

## 项目结构

```text
src/
├── components/       可复用界面组件
├── data/blog/        Markdown 文章
├── layouts/          页面骨架和 SEO
├── lib/              文章查询、排序和阅读时长
├── pages/            Astro 路由
├── styles/           全局设计系统
├── config.ts         站点文案和专题配置
└── content.config.ts 内容集合 Schema
```
