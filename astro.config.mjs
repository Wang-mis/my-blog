import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

function normalizeSiteUrl(value) {
  const rawValue = value?.trim();

  if (!rawValue) {
    return undefined;
  }

  const candidate = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

  try {
    return new URL(candidate).origin;
  } catch {
    return undefined;
  }
}

const site =
  normalizeSiteUrl(process.env.SITE_URL) ??
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  'http://localhost:4321';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: false,
    },
  },
});
