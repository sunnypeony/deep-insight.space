// 内容接口规范（schema）。所有页面内容都在仓库根目录的 content/ 下，
// 这里定义每类文件允许的 frontmatter 字段。字段说明见 CONTENT_GUIDE.md。
//
// 约定：content/<集合>/<语言>/<slug>.md(x)，语言为 en 或 zh。
// 未知字段会直接报错（.strict()），以便尽早发现拼写错误。
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const entries = (dir: string) =>
  glob({ pattern: ['{en,zh}/**/*.{md,mdx}', '!**/_*'], base: `./content/${dir}` });

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'use lowercase-kebab-case');
/** 日期必须写成 YYYY-MM-DD */
const date = z
  .union([z.date(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD')])
  .transform((v) => new Date(v));
const sectionHead = z
  .object({ eyebrow: z.string(), title: z.string(), aside: z.string().optional() })
  .strict();

/** 站点设置：content/settings.yaml */
const settings = defineCollection({
  loader: file('./content/settings.yaml'),
  schema: z
    .object({
      name: z.string(),
      domain: z.string(),
      tagline: z.string(),
      author: z.string(),
      links: z
        .object({
          linkedin: z.url(),
          github: z.url(),
          youtube: z.url(),
          email: z.email().optional(),
        })
        .strict(),
    })
    .strict(),
});

/** 单页：content/pages/<lang>/home.md 与 about.md */
const pages = defineCollection({
  loader: entries('pages'),
  schema: z.discriminatedUnion('page', [
    z
      .object({
        page: z.literal('home'),
        description: z.string(),
        hero: z
          .object({
            eyebrow: z.string(),
            /** 多行标题，换行即断行；用 *星号* 包住要强调的词 */
            title: z.string(),
            lede: z.string(),
            primaryCta: z.string(),
            authorCta: z.string(),
          })
          .strict(),
        stats: z.object({ tracks: z.string(), notes: z.string(), thread: z.string(), threadValue: z.string() }).strict(),
        sections: z
          .object({
            map: sectionHead,
            recipe: sectionHead.extend({ steps: z.array(z.object({ step: z.string(), desc: z.string() }).strict()) }),
            notes: sectionHead,
            projects: sectionHead,
            videos: sectionHead.extend({ cta: z.string() }),
          })
          .strict(),
      })
      .strict(),
    z
      .object({
        page: z.literal('about'),
        title: z.string(),
        description: z.string(),
        /** 首页 About 卡片的大标题，换行即断行 */
        headline: z.string(),
        /** 首页 About 卡片的一段简介 */
        summary: z.string(),
        journey: z.array(z.string()).min(1),
        updated: date.optional(),
      })
      .strict(),
  ]),
});

/** 知识地图板块：content/topics/<lang>/<slug>.md */
const topics = defineCollection({
  loader: entries('topics'),
  schema: z
    .object({
      title: z.string(),
      /** 卡片上的英文小标题，如 Foundations */
      eyebrow: z.string(),
      order: z.number().int(),
      summary: z.string(),
      keywords: z.array(z.string()).min(1),
      outline: z.array(z.object({ title: z.string(), question: z.string() }).strict()).default([]),
    })
    .strict(),
});

/** 文章（博客 / 笔记）：content/notes/<lang>/<slug>.md(x) */
const notes = defineCollection({
  loader: entries('notes'),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      date: date,
      updated: date.optional(),
      /** 所属板块，对应 content/topics/<lang>/<topic>.md 的文件名 */
      topic: slug,
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      youtubeId: z.string().optional(),
      /** 所属系列，对应 content/series/<lang>/<series>.md 的文件名；与 seriesOrder 同时出现 */
      series: slug.optional(),
      /** 在系列中的章节序号 */
      seriesOrder: z.number().int().positive().optional(),
    })
    .strict()
    .superRefine((d, ctx) => {
      if (d.series !== undefined && d.seriesOrder === undefined) {
        ctx.addIssue({ code: 'custom', path: ['seriesOrder'], message: 'required when `series` is set' });
      }
      if (d.seriesOrder !== undefined && d.series === undefined) {
        ctx.addIssue({ code: 'custom', path: ['series'], message: 'required when `seriesOrder` is set' });
      }
    }),
});

/** 系列：content/series/<lang>/<slug>.md；正文（可选）是系列总览 */
const series = defineCollection({
  loader: entries('series'),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      /** 所属板块，对应 content/topics/<lang>/<topic>.md 的文件名 */
      topic: slug,
      date: date,
      updated: date.optional(),
      draft: z.boolean().default(false),
    })
    .strict(),
});

/** 项目：content/projects/<lang>/<slug>.md(x) */
const projects = defineCollection({
  loader: entries('projects'),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      status: z.enum(['active', 'done', 'planned']),
      date: date,
      updated: date.optional(),
      order: z.number().int().default(100),
      tags: z.array(z.string()).default([]),
      role: z.string().optional(),
      stack: z.array(z.string()).default([]),
      links: z.array(z.object({ label: z.string(), url: z.url() }).strict()).default([]),
      draft: z.boolean().default(false),
      youtubeId: z.string().optional(),
    })
    .strict(),
});

/** 视频卡片：content/videos/<lang>/<slug>.md（只用 frontmatter） */
const videos = defineCollection({
  loader: entries('videos'),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      date: date,
      /** 留空表示“制作中” */
      youtubeId: z.string().optional(),
      /** 卡片上的小标签 */
      label: z.string(),
      /** 可选：配套文章的 slug */
      note: slug.optional(),
    })
    .strict(),
});

export const collections = { settings, pages, topics, notes, series, projects, videos };
