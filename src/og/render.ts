// 构建时生成 Open Graph 分享图（1200×630 PNG）：satori 排版成 SVG，resvg 栅格化。
// 字体在 ./fonts 下，只在构建时读取，不会发给访客。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// 构建时代码会被打包到 dist/ 下，所以按项目根目录（npm run build 的工作目录）定位字体
const font = (file: string) => readFileSync(join(process.cwd(), 'src/og/fonts', file));
const fonts = [
  { name: 'Newsreader', data: font('newsreader-latin-500-normal.woff'), weight: 500, style: 'normal' },
  { name: 'Inter', data: font('inter-latin-500-normal.woff'), weight: 500, style: 'normal' },
  { name: 'Inter', data: font('inter-latin-600-normal.woff'), weight: 600, style: 'normal' },
  // 中文字形；拉丁字体里没有的字会回落到这里
  { name: 'Noto Serif SC', data: font('NotoSerifSC-SemiBold-GB2312.woff'), weight: 600, style: 'normal' },
] as const;

const C = {
  bg: '#f4f2ec',
  panel: '#e7ebe5',
  ink: '#1b1d1c',
  ink2: '#4a4f4c',
  muted: '#7a7f7b',
  brand: '#2f6b66',
  brandSoft: '#d5e2de',
  accent: '#c1694f',
  x: '#c1694f',
  y: '#6f9a72',
  z: '#4a7aa0',
};
const SERIF = 'Newsreader, Noto Serif SC';
const SANS = 'Inter, Noto Serif SC';

type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style, children: children.length <= 1 ? children[0] : children },
});

export type OgCard = {
  lang: 'en' | 'zh';
  /** 小标题，例如 "SERIES · FOUNDATIONS" */
  eyebrow: string;
  /** 标题；换行即断行，*星号* 包住的词用品牌色强调 */
  title: string;
  summary?: string;
  /** 底部左侧的标签，例如 "8 chapters" */
  meta?: string[];
  siteName: string;
  tagline: string;
  domain: string;
};

/** 按语言粗略截断摘要，避免溢出卡片 */
function clip(text: string, lang: 'en' | 'zh') {
  const max = lang === 'zh' ? 78 : 170;
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max).replace(/[\s,，、。;；:：]+$/, '')}…` : t;
}

/** 粗略估计标题会占几行（左栏约 650px 宽） */
function titleLineCount(title: string, size: number, lang: 'en' | 'zh') {
  const perLine = Math.floor(650 / (size * (lang === 'zh' ? 1.0 : 0.47)));
  return title
    .replace(/\*/g, '')
    .split('\n')
    .reduce((n, line) => n + Math.max(1, Math.ceil(line.trim().length / perLine)), 0);
}

function titleSize(title: string, lang: 'en' | 'zh') {
  const len = title.replace(/\*/g, '').length * (lang === 'zh' ? 1.9 : 1);
  return len > 70 ? 50 : len > 46 ? 58 : 68;
}

/** 右侧的坐标系图案（与首页交互图同一视觉语言） */
const FRAME_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="-150 -150 300 300">
  <g fill="none" stroke="#c9c7be" stroke-width="1.6">
    <circle r="118"/><ellipse rx="118" ry="38"/><ellipse rx="42" ry="118" transform="rotate(28)"/>
  </g>
  <ellipse rx="118" ry="64" transform="rotate(-24)" fill="none" stroke="${C.accent}" stroke-width="1.6" stroke-dasharray="4 7" opacity="0.7"/>
  <g stroke-width="4" stroke-linecap="round">
    <line x1="0" y1="0" x2="104" y2="-30" stroke="${C.x}"/>
    <line x1="0" y1="0" x2="-58" y2="-70" stroke="${C.y}"/>
    <line x1="0" y1="0" x2="-8" y2="102" stroke="${C.z}"/>
  </g>
  <circle r="5" fill="${C.ink2}"/>
  <circle cx="62" cy="-86" r="18" fill="${C.accent}" opacity="0.18"/>
  <circle cx="62" cy="-86" r="8" fill="${C.accent}"/>
</svg>`;
const frameArt = (): Node => ({
  type: 'img',
  props: { src: `data:image/svg+xml;base64,${Buffer.from(FRAME_SVG).toString('base64')}`, width: 300, height: 300 },
});

export async function renderOgPng(card: OgCard): Promise<Uint8Array> {
  const art = frameArt();
  const size = titleSize(card.title, card.lang);
  const titleLines = card.title
    .trim()
    .split('\n')
    .map((line) =>
      h(
        'div',
        { display: 'flex', flexWrap: 'wrap' },
        ...line
          .split(/(\*[^*]+\*)/)
          .filter(Boolean)
          .map((part) =>
            part.startsWith('*')
              ? h('span', { color: C.brand, whiteSpace: 'pre-wrap' }, part.slice(1, -1))
              : h('span', { whiteSpace: 'pre-wrap' }, part),
          ),
      ),
    );

  const tree = h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      background: C.bg,
      fontFamily: SANS,
      color: C.ink,
      position: 'relative',
    },
    // 右侧浅色面板 + 坐标系
    h(
      'div',
      {
        position: 'absolute',
        right: 56,
        top: 56,
        width: 340,
        height: 518,
        borderRadius: 32,
        background: C.panel,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      art,
    ),
    // 左侧内容
    h(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        // satori 的 height 不含 padding：522 + 56 + 52 = 630
        width: 676,
        height: 522,
        padding: '56px 0 52px 72px',
      },
      // 品牌
      h(
        'div',
        { display: 'flex', alignItems: 'center' },
        h(
          'div',
          {
            width: 56,
            height: 56,
            borderRadius: 16,
            background: C.brand,
            color: C.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: SERIF,
            fontSize: 34,
          },
          'D',
        ),
        h(
          'div',
          { display: 'flex', flexDirection: 'column', marginLeft: 18 },
          h('div', { fontSize: 26, fontWeight: 600, color: C.ink }, card.siteName),
          h('div', { fontSize: 15, letterSpacing: 3, color: C.muted, marginTop: 4 }, card.tagline.toUpperCase()),
        ),
      ),
      // 小标题
      h(
        'div',
        { marginTop: 62, fontSize: 19, fontWeight: 600, letterSpacing: card.lang === 'zh' ? 1.5 : 4, color: C.brand },
        card.eyebrow.toUpperCase(),
      ),
      // 标题
      h(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          marginTop: 18,
          fontFamily: SERIF,
          fontSize: size,
          lineHeight: 1.12,
          color: C.ink,
        },
        ...titleLines,
      ),
      // 摘要
      card.summary
        ? h(
            'div',
            {
              display: 'block',
              marginTop: 26,
              fontSize: 25,
              lineHeight: 1.5,
              color: C.ink2,
              lineClamp: titleLineCount(card.title, size, card.lang) >= 3 ? 2 : 3,
            },
            clip(card.summary, card.lang),
          )
        : h('div', {}),
      // 底部
      h(
        'div',
        { display: 'flex', alignItems: 'center', position: 'absolute', left: 72, bottom: 48 },
        ...(card.meta ?? []).map((m) =>
          h(
            'div',
            {
              fontSize: 19,
              fontWeight: 600,
              color: C.brand,
              background: C.brandSoft,
              padding: '7px 18px',
              borderRadius: 999,
              marginRight: 12,
            },
            m,
          ),
        ),
        h('div', { fontSize: 19, color: C.muted, marginLeft: (card.meta?.length ?? 0) > 0 ? 8 : 0 }, card.domain),
      ),
    ),
  );

  const svg = await satori(tree as never, { width: 1200, height: 630, fonts: fonts as never });
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}
