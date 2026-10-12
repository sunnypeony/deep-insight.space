// 读取 content/ 的工具函数：按语言取内容、找翻译版本、生成链接。
// 页面组件只通过这里拿数据，不在组件里写内容。
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { languages, localizePath, type Lang } from '../i18n';

export const LANGS = Object.keys(languages) as Lang[];
const other = (lang: Lang): Lang => (lang === 'en' ? 'zh' : 'en');

type Localized = 'pages' | 'topics' | 'notes' | 'projects' | 'videos';
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
export function entryHref(collection: 'notes' | 'projects' | 'topics', lang: Lang, slug: string) {
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
export async function getTranslation<C extends 'notes' | 'projects'>(collection: C, lang: Lang, slug: string) {
  const t = (await getEntry(collection, `${other(lang)}/${slug}`)) as Entry<C> | undefined;
  return t && isVisible(t) ? t : undefined;
}

/** 生成某一语言下某集合的静态路由 */
export async function pathsFor<C extends 'notes' | 'projects'>(collection: C, lang: Lang) {
  if (collection === 'notes') await assertNoteTopics();
  const all = (await getCollection(collection)) as Entry<C>[];
  return all
    .filter((e) => splitId(e.id).lang === lang && isVisible(e) && (collection === 'notes' || hasBody(e)))
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

/** 检查文章的 topic 字段是否指向存在的板块 */
export async function assertNoteTopics() {
  const topicSlugs = new Set((await getCollection('topics')).map((t) => splitId(t.id).slug));
  for (const n of await getCollection('notes')) {
    if (!topicSlugs.has(n.data.topic)) {
      throw new Error(
        `content/notes/${n.id}: topic "${n.data.topic}" does not exist. Use one of: ${[...topicSlugs].join(', ')}`,
      );
    }
  }
}

export const byDateDesc = (a: { entry: { data: { date: Date } } }, b: { entry: { data: { date: Date } } }) =>
  b.entry.data.date.valueOf() - a.entry.data.date.valueOf();

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
