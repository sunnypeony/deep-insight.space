// 语言设置与“界面固定文字”（按钮、无障碍标签、状态标记等）。
// 这些属于代码的一部分，不是内容：标题、简介、正文都在 content/ 目录。
// 英文是默认语言（网址 /），中文在 /zh/ 下。

export const languages = { en: 'English', zh: '中文' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';
export const htmlLang: Record<Lang, string> = { en: 'en', zh: 'zh-CN' };

/** 去掉语言前缀，得到“与语言无关”的路径，例如 /zh/topics/x/ → /topics/x/ */
export function stripLang(path: string) {
  const stripped = path.replace(/^\/zh(?=\/|$)/, '');
  return stripped === '' ? '/' : stripped;
}

/** 把路径转换到指定语言下，例如 ('/topics/x/', 'zh') → '/zh/topics/x/' */
export function localizePath(path: string, lang: Lang) {
  const base = stripLang(path);
  if (lang === defaultLang) return base;
  return base === '/' ? '/zh/' : `/zh${base}`;
}

export const ui = {
  en: {
    skip: 'Skip to content',
    home: 'home',
    themeToggle: 'Toggle dark / light mode',
    menuOpen: 'Open menu',
    language: 'Language',
    mainNav: 'Main navigation',
    nav: { map: 'Map', notes: 'Notes', projects: 'Projects', videos: 'Videos', about: 'About' },

    vizLabel: 'A 3D coordinate frame driven by a quaternion — drag to rotate',
    vizHint: 'Drag to rotate · double-click to reset',

    routeLabel: 'Learning path',
    noteCount: (n: number) => `${n} note${n === 1 ? '' : 's'}`,
    comingSoon: 'In progress',
    draft: 'Writing',
    readMore: 'Read more',
    allNotes: 'All notes',
    journeyLabel: 'My path',
    status: { active: 'Active', done: 'Done', planned: 'Planned' },
    inProduction: 'In production',
    play: 'Play',
    openOnYouTube: 'Open on YouTube',
    otherLang: '中文',

    footerTagline: 'Notes from geometry to embodied intelligence',
    footerLang: 'English & 中文',

    backToMap: '← Knowledge map',
    backToNotes: '← All notes',
    backToProjects: '← Projects',
    published: 'Published notes',
    planned: 'Questions on the roadmap',
    empty: 'Notes for this stop are being written — coming soon.',
    adjacent: 'Adjacent tracks',
    draftBadge: 'Draft',
    updated: 'Updated',
    tags: 'Tags',
    role: 'Role',
    stack: 'Stack',
    links: 'Links',
    notesIndexTitle: 'Notes',
    notesIndexDescription: 'Every note on Deep Insight, newest first.',

    series: 'Series',
    seriesContents: 'Series contents',
    seriesChapters: 'Chapters',
    chapter: (n: number) => `Chapter ${n}`,
    chapterOf: (n: number, total: number) => `Chapter ${n} of ${total}`,
    chapterCount: (n: number) => `${n} chapter${n === 1 ? '' : 's'}`,
    seriesCount: (n: number) => `${n} series`,
    project: 'Project',
    prevChapter: 'Previous chapter',
    nextChapter: 'Next chapter',
    seriesNav: 'Series navigation',
    backToSeries: '← Series overview',
  },
  zh: {
    skip: '跳到正文',
    home: '首页',
    themeToggle: '切换深色 / 浅色模式',
    menuOpen: '打开菜单',
    language: '语言',
    mainNav: '主导航',
    nav: { map: '知识地图', notes: '笔记', projects: '项目', videos: '视频', about: '关于' },

    vizLabel: '由四元数驱动的三维坐标系，可拖动旋转',
    vizHint: '拖动旋转 · 双击复位',

    routeLabel: '学习路径',
    noteCount: (n: number) => `${n} 篇笔记`,
    comingSoon: '整理中',
    draft: '撰写中',
    readMore: '了解更多',
    allNotes: '全部笔记',
    journeyLabel: '我的路径',
    status: { active: '进行中', done: '已完成', planned: '计划中' },
    inProduction: '制作中',
    play: '播放',
    openOnYouTube: '在 YouTube 打开',
    otherLang: 'English',

    footerTagline: 'Notes from geometry to embodied intelligence',
    footerLang: '中文为主 · English technical terms',

    backToMap: '← 知识地图',
    backToNotes: '← 全部笔记',
    backToProjects: '← 项目',
    published: '已发布的笔记',
    planned: '计划中的问题',
    empty: '这一站的笔记正在整理中，很快就会和大家见面。',
    adjacent: '相邻板块',
    draftBadge: '草稿',
    updated: '更新于',
    tags: '标签',
    role: '角色',
    stack: '技术栈',
    links: '链接',
    notesIndexTitle: '笔记',
    notesIndexDescription: 'Deep Insight 上的全部笔记，按时间倒序。',

    series: '系列',
    seriesContents: '系列目录',
    seriesChapters: '章节',
    chapter: (n: number) => `第 ${n} 章`,
    chapterOf: (n: number, total: number) => `第 ${n} / ${total} 章`,
    chapterCount: (n: number) => `${n} 章`,
    seriesCount: (n: number) => `${n} 个系列`,
    project: '项目',
    prevChapter: '上一章',
    nextChapter: '下一章',
    seriesNav: '系列导航',
    backToSeries: '← 系列总览',
  },
} as const;

export const useT = (lang: Lang) => ui[lang];
