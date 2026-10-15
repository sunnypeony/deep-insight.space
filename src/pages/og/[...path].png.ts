// 构建时生成的 Open Graph 图片：
//   /og/<lang>/home.png、/og/<lang>/series/<slug>.png、/og/<lang>/projects/<slug>.png
// 只为实际生成了页面的条目出图（草稿系列、无正文项目在正式构建里没有页面，也就没有图）。
import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOgPng, type OgCard } from '../../og/render';
import { getPage, getSeriesChapters, getSettings, getTopics, LANGS, pathsFor } from '../../lib/content';
import { useT } from '../../i18n';

export const getStaticPaths = (async () => {
  const site = await getSettings();
  const base = { siteName: site.name, tagline: site.tagline, domain: site.domain };
  const out: { params: { path: string }; props: { card: OgCard } }[] = [];

  for (const lang of LANGS) {
    const t = useT(lang);
    const home = (await getPage(lang, 'home')).data;
    out.push({
      params: { path: `${lang}/home` },
      props: { card: { ...base, lang, eyebrow: home.hero.eyebrow, title: home.hero.title, summary: home.hero.lede } },
    });

    const topics = new Map((await getTopics(lang)).map((tp) => [tp.slug, tp.entry.data.title]));
    for (const { params, props } of await pathsFor('series', lang)) {
      const d = props.entry.data;
      const chapters = (await getSeriesChapters(lang, params.slug)).length;
      out.push({
        params: { path: `${lang}/series/${params.slug}` },
        props: {
          card: {
            ...base,
            lang,
            eyebrow: `${t.series} · ${topics.get(d.topic) ?? d.topic}`,
            title: d.title,
            summary: d.summary,
            meta: [t.chapterCount(chapters)],
          },
        },
      });
    }

    for (const { params, props } of await pathsFor('projects', lang)) {
      const d = props.entry.data;
      out.push({
        params: { path: `${lang}/projects/${params.slug}` },
        props: {
          card: {
            ...base,
            lang,
            eyebrow: `${t.project} · ${t.status[d.status]}`,
            title: d.title,
            summary: d.summary,
            meta: d.tags.slice(0, 3),
          },
        },
      });
    }
  }
  return out;
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgPng((props as { card: OgCard }).card);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
