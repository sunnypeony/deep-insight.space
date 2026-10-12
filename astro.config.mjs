// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://deepinsight.space',
  trailingSlash: 'ignore',
  integrations: [mdx(), sitemap()],
  markdown: {
    // 使用 remark/rehype 处理器，以便用 KaTeX 渲染 $...$ 与 $$...$$ 公式
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
