// 在 .mdx 文章里可以直接使用的组件（无需 import）。新增组件时同步更新 CONTENT_GUIDE.md。
import Callout from './Callout.astro';
import YouTubeEmbed from './YouTubeEmbed.astro';

export const mdxComponents = { Callout, YouTube: YouTubeEmbed };
