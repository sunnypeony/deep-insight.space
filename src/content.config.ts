import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const notes = defineCollection({
  // 以下划线开头的文件（如 _template.md）不会被收录
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** 对应 src/data/site.ts 中 topics 的 slug */
    topic: z.enum(['foundations', 'transforms', 'perception', 'world-models', 'projects']),
    /** 首页列表上显示的小标签 */
    label: z.string(),
    date: z.coerce.date(),
    /** 草稿：开发模式可预览，正式构建时不生成页面 */
    draft: z.boolean().default(false),
    youtubeId: z.string().optional(),
  }),
});

export const collections = { notes };
