// 语言与界面文案。英文是默认语言（网址 /），中文在 /zh/ 下。

export const languages = { en: 'English', zh: '中文' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';
export const htmlLang: Record<Lang, string> = { en: 'en', zh: 'zh-CN' };

/** 一段需要双语的文字 */
export type L = Record<Lang, string>;

export const pick = (value: L, lang: Lang) => value[lang];

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

    eyebrow: 'A personal field guide to seeing the world',
    heroLines: ['Start from geometry,', 'learn how machines'],
    heroEm: 'see',
    heroTail: ' the world.',
    lede: 'Connecting mathematical intuition, robot coordinate frames, 3D perception and world models into one continuous thread — notes on how I move from first principles to real sensors and embodied systems.',
    ctaMap: 'Start with the map',
    ctaAuthor: 'About the author',
    stats: { tracks: 'Tracks', notes: 'Notes', thread: 'Thread', threadValue: 'Geometry → Perception → Action' },

    vizLabel: 'A 3D coordinate frame driven by a quaternion — drag to rotate',
    vizHint: 'Drag to rotate · double-click to reset',

    mapEyebrow: 'Knowledge Map',
    mapTitle: 'Knowledge Map',
    mapAside: 'From mathematical foundations to how robots perceive and act. Each stop stands alone, and links to the others.',
    routeLabel: 'Learning path',
    noteCount: (n: number) => `${n} note${n === 1 ? '' : 's'}`,
    comingSoon: 'In progress',

    recipeEyebrow: 'How each note is built',
    recipeTitle: 'Every note follows the same path',

    notesEyebrow: 'Recent Thinking',
    notesTitle: 'Recent Thinking',
    notesAside: 'Long-form essays and concept breakdowns',
    draft: 'Writing',

    aboutEyebrow: 'About this space',
    aboutTitle: ['Real world → Perception', '→ Representation → Action'],
    aboutBody: (name: string) =>
      `I'm ${name}, an engineer moving from computer vision toward robot perception. This space holds foundational study notes alongside practice logs that put each concept back into RGB-D, LiDAR, ROS 2 and drone projects.`,
    journeyLabel: 'My path',

    projectsEyebrow: 'Projects & Practice',
    projectsTitle: 'Projects & Practice',
    projectsAside: 'Putting concepts back into real sensors, real data — and failed experiments.',
    status: { active: 'Active', done: 'Done', planned: 'Planned' },

    videosEyebrow: 'Videos',
    videosTitle: 'See the figures, the experiments — and the derivations',
    videosAside: 'Short explainers and project demos live on YouTube, embedded next to the formulas, code and references of each note.',
    videosCta: 'Visit channel',
    inProduction: 'In production',
    play: 'Play',
    openOnYouTube: 'Open on YouTube',

    footerTagline: 'Notes from geometry to embodied intelligence',
    footerLang: 'English & 中文',

    backToMap: '← Knowledge map',
    published: 'Published notes',
    planned: 'Questions on the roadmap',
    empty: 'Notes for this stop are being written — coming soon.',
    draftLocal: 'Draft · local preview only',
    adjacent: 'Adjacent tracks',
  },
  zh: {
    skip: '跳到正文',
    home: '首页',
    themeToggle: '切换深色 / 浅色模式',
    menuOpen: '打开菜单',
    language: '语言',
    mainNav: '主导航',
    nav: { map: '知识地图', notes: '最近在想', projects: '项目', videos: '视频', about: '关于' },

    eyebrow: 'A personal field guide to seeing the world',
    heroLines: ['从几何出发，', '理解机器如何'],
    heroEm: '看见',
    heroTail: '世界。',
    lede: '把数学直觉、机器人坐标系、3D 感知与世界模型连成一条线。这里记录我如何从基础概念，走向真实传感器与具身智能系统。',
    ctaMap: '从知识地图开始',
    ctaAuthor: '认识作者',
    stats: { tracks: '板块', notes: '笔记', thread: '主线', threadValue: '几何 → 感知 → 行动' },

    vizLabel: '由四元数驱动的三维坐标系，可拖动旋转',
    vizHint: '拖动旋转 · 双击复位',

    mapEyebrow: 'Knowledge Map',
    mapTitle: '知识地图',
    mapAside: '从数学基础，到机器人如何感知和行动。每一站都可以单独读，也彼此链接。',
    routeLabel: '学习路径',
    noteCount: (n: number) => `${n} 篇笔记`,
    comingSoon: '整理中',

    recipeEyebrow: 'How each note is built',
    recipeTitle: '每篇笔记，都走同一条路',

    notesEyebrow: 'Recent Thinking',
    notesTitle: '最近在想',
    notesAside: '精选长文与概念拆解',
    draft: '撰写中',

    aboutEyebrow: 'About this space',
    aboutTitle: ['真实世界 → 感知', '→ 表示 → 行动'],
    aboutBody: (name: string) =>
      `我是 ${name}，一名从计算机视觉走向机器人感知的工程师。这里既有打牢基础的学习笔记，也有把概念放回 RGB-D、LiDAR、ROS 2 与无人机项目中的实践记录。`,
    journeyLabel: '我的路径',

    projectsEyebrow: 'Projects & Practice',
    projectsTitle: '项目与实践',
    projectsAside: '把概念放回真实的传感器、数据，以及失败的实验里。',
    status: { active: '进行中', done: '已完成', planned: '计划中' },

    videosEyebrow: 'Videos',
    videosTitle: '看图、看实验，也看推导过程',
    videosAside: '短讲解与项目演示集中放在 YouTube，再嵌入对应文章，和公式、代码、参考资料放在一起。',
    videosCta: '前往频道',
    inProduction: '制作中',
    play: '播放',
    openOnYouTube: '在 YouTube 打开',

    footerTagline: 'Notes from geometry to embodied intelligence',
    footerLang: '中文为主 · English technical terms',

    backToMap: '← 知识地图',
    published: '已发布的笔记',
    planned: '计划中的问题',
    empty: '这一站的笔记正在整理中，很快就会和大家见面。',
    draftLocal: '草稿 · 仅本地可见',
    adjacent: '相邻板块',
  },
} as const;

export const useT = (lang: Lang) => ui[lang];
