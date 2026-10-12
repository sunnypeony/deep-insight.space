// 读取 content/ 的工具函数：按语言取内容、找翻译版本、生成链接。
// 页面组件只通过这里拿数据，不在组件里写内容。
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { languages, localizePath, type Lang } from '../i18n';

export const LANGS = Object.keys(languages) as Lang[];
const other = (lang: Lang): Lang => (lang === 'en' ? 'zh' : 'en');

type Localized = 'pages' | 'topics' | 'notes' | 'series' | 'projects' | 'videos';
type Entry<C extends Localized> = CollectionEntry<C>;

/** 'zh/quaternion-origin' → { lang: 'zh', slug: 'quaternion-origin' } */
export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang as Lang, slug: rest.join('/') };
}

/** 草稿只在本地开发时可见 */
export const isVisible = (e: { data: { draft?: boolean } }) => import.meta.env.DEV || !e.data.draft;
export const hasBody = (e: { body?: string }) => Boolean(e.body?.trim());

export async function getSettings() {
  const s = await getEntry('settings', 'site');
  if (!s) throw new Error('content/settings.yaml must define a top-level `site:` entry.');
  return s.data;
}

export async function getPage<P extends 'home' | 'about'>(lang: Lang, page: P) {
  const e = await getEntry('pages', `${lang}/${page}`);
  if (!e) throw new Error(`Missing content/pages/${lang}/${page}.md`);
  if (e.data.page !== page) throw new Error(`content/pages/${lang}/${page}.md must set \`page: ${page}\``);
  return e as Entry<'pages'> & { data: Extract<Entry<'pages'>['data'], { page: P }> };
}

/** 页面网址 */
export function entryHref(collection: 'notes' | 'series' | 'projects' | 'topics', lang: Lang, slug: string) {
  return localizePath(`/${collection}/${slug}/`, lang);
}

export type Item<C extends Localized> = {
  slug: string;
  /** 实际显示的版本所用的语言 */
  lang: Lang;
  /** 是否因为缺少当前语言版本而使用了另一种语言 */
  fallback: boolean;
  entry: Entry<C>;
};

/** 每个 slug 取一个版本：优先当前语言，否则用另一种语言 */
export async function getLocalized<C extends Localized>(collection: C, lang: Lang): Promise<Item<C>[]> {
  const all = (await getCollection(collection)) as Entry<C>[];
  const bySlug = new Map<string, Item<C>>();
  for (const entry of all) {
    const { lang: l, slug } = splitId(entry.id);
    const current = bySlug.get(slug);
    if (!current || (current.fallback && l === lang)) bySlug.set(slug, { slug, lang: l, fallback: l !== lang, entry });
  }
  return [...bySlug.values()];
}

/** 同一 slug 在另一种语言里的版本（用于语言切换） */
export async function getTranslation<C extends 'notes' | 'series' | 'projects'>(collection: C, lang: Lang, slug: string) {
  const t = (await getEntry(collection, `${other(lang)}/${slug}`)) as Entry<C> | undefined;
  return t && isVisible(t) ? t : undefined;
}

/** 生成某一语言下某集合的静态路由 */
export async function pathsFor<C extends 'notes' | 'series' | 'projects'>(collection: C, lang: Lang) {
  if (collection !== 'projects') await assertContentRefs();
  const all = (await getCollection(collection)) as Entry<C>[];
  return all
    .filter((e) => splitId(e.id).lang === lang && isVisible(e) && (collection !== 'projects' || hasBody(e)))
    .map((entry) => ({ params: { slug: splitId(entry.id).slug }, props: { entry } }));
}

/** 板块：两种语言都必须齐全，并按 order 排序 */
export async function getTopics(lang: Lang) {
  const all = await getCollection('topics');
  const mine = all.filter((t) => splitId(t.id).lang === lang);
  const otherSlugs = all.filter((t) => splitId(t.id).lang !== lang).map((t) => splitId(t.id).slug);
  for (const s of otherSlugs) {
    if (!mine.some((t) => splitId(t.id).slug === s)) {
      throw new Error(`Topic "${s}" is missing its ${lang} version: content/topics/${lang}/${s}.md`);
    }
  }
  return mine.sort((a, b) => a.data.order - b.data.order).map((entry) => ({ slug: splitId(entry.id).slug, entry }));
}

/**
 * 跨文件校验：topic / series 引用是否存在，系列内章节序号是否重复。
 * （series 与 seriesOrder 是否成对出现，由 content.config.ts 的 schema 检查。）
 */
export async function assertContentRefs() {
  const topicSlugs = new Set((await getCollection('topics')).map((t) => splitId(t.id).slug));
  const topicList = [...topicSlugs].join(', ');
  const seriesIds = new Set((await getCollection('series')).map((s) => s.id));
  for (const s of await getCollection('series')) {
    if (!topicSlugs.has(s.data.topic)) {
      throw new Error(`content/series/${s.id}: topic "${s.data.topic}" does not exist. Use one of: ${topicList}`);
    }
  }
  const usedOrders = new Map<string, string>();
  for (const n of await getCollection('notes')) {
    if (!topicSlugs.has(n.data.topic)) {
      throw new Error(`content/notes/${n.id}: topic "${n.data.topic}" does not exist. Use one of: ${topicList}`);
    }
    if (n.data.series === undefined) continue;
    const { lang } = splitId(n.id);
    if (!seriesIds.has(`${lang}/${n.data.series}`)) {
      throw new Error(
        `content/notes/${n.id}: series "${n.data.series}" does not exist in ${lang}. Expected content/series/${lang}/${n.data.series}.md`,
      );
    }
    const key = `${lang}/${n.data.series}#${n.data.seriesOrder}`;
    const taken = usedOrders.get(key);
    if (taken) {
      throw new Error(
        `content/notes/${n.id}: seriesOrder ${n.data.seriesOrder} in series "${n.data.series}" is already used by content/notes/${taken}`,
      );
    }
    usedOrders.set(key, n.id);
  }
}

/**
 * 出现在首页、笔记列表、板块页里的笔记：
 * 所属系列仍是草稿时，正式站点不列出它的章节（开发模式照常可见）。
 */
export async function getListedNotes(lang: Lang) {
  const series = await getCollection('series');
  const hidden = new Set(series.filter((s) => !isVisible(s)).map((s) => s.id));
  return (await getLocalized('notes', lang)).filter(
    (n) => !(n.entry.data.series && hidden.has(`${n.lang}/${n.entry.data.series}`)),
  );
}

export type Chapter = { slug: string; order: number; entry: Entry<'notes'> };

/** 某一语言下某系列的全部章节，按 seriesOrder 排序 */
export async function getSeriesChapters(lang: Lang, seriesSlug: string): Promise<Chapter[]> {
  const notes = await getCollection('notes', (n) => splitId(n.id).lang === lang && n.data.series === seriesSlug);
  return notes
    .map((entry) => ({ slug: splitId(entry.id).slug, order: entry.data.seriesOrder!, entry }))
    .sort((a, b) => a.order - b.order);
}

/** 文章所在系列的上下文：系列本身、全部章节、当前位置，以及跳过不可见章节后的上一章 / 下一章 */
export async function getSeriesContext(note: Entry<'notes'>) {
  if (!note.data.series) return undefined;
  const { lang, slug } = splitId(note.id);
  const series = await getEntry('series', `${lang}/${note.data.series}`);
  if (!series) return undefined;
  const chapters = await getSeriesChapters(lang, note.data.series);
  const index = chapters.findIndex((c) => c.slug === slug);
  const prev = chapters.slice(0, index).reverse().find((c) => isVisible(c.entry));
  const next = chapters.slice(index + 1).find((c) => isVisible(c.entry));
  return { series, slug: note.data.series, chapters, index, prev, next };
}

/** 板块页上的系列卡片：每个 slug 取一个语言版本，草稿只在开发模式显示 */
export async function getSeriesForTopic(lang: Lang, topic: string) {
  const items = (await getLocalized('series', lang)).filter((s) => s.entry.data.topic === topic && isVisible(s.entry));
  return Promise.all(
    items.map(async (s) => ({ ...s, chapters: (await getSeriesChapters(s.lang, s.slug)).length })),
  );
}

type Dated = { entry: { data: { date: Date; seriesOrder?: number } } };
/** 按日期倒序；同一天的系列章节按章节序号排列 */
export const byDateDesc = (a: Dated, b: Dated) =>
  b.entry.data.date.valueOf() - a.entry.data.date.valueOf() ||
  (a.entry.data.seriesOrder ?? 0) - (b.entry.data.seriesOrder ?? 0);

export function formatDate(d: Date, lang: Lang) {
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** 把 "第一行\n*强调*第二行" 拆成行与片段，用于标题渲染 */
export function emphasisLines(text: string) {
  return text
    .trim()
    .split('\n')
    .map((line) =>
      line.split(/(\*[^*]+\*)/).filter(Boolean).map((part) =>
        part.startsWith('*') && part.endsWith('*') ? { em: true, text: part.slice(1, -1) } : { em: false, text: part },
      ),
    );
}
