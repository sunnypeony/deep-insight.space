# Deep Insight · deepinsight.space

从几何出发，理解机器如何看见世界 —— 关于坐标变换、四元数、3D 感知、SLAM 与世界模型的个人知识站。

基于 [Astro](https://astro.build) 的纯静态站点：Markdown 写文章、KaTeX 渲染公式、YouTube 轻量嵌入、自动深浅色模式。

## 本地运行

需要 **Node.js ≥ 22.12**（`node -v` 查看；推荐用 [nvm](https://github.com/nvm-sh/nvm)：`nvm install 22`）。

```bash
git clone https://github.com/sunnypeony/deep-insight.space.git
cd deep-insight.space
npm install        # 安装依赖
npm run dev        # 开发模式 → http://localhost:4321 （改代码自动刷新）
npm run build      # 生成静态文件到 dist/
npm run preview    # 本地预览 dist/ 的正式效果
```

## 目录结构

```
src/
├─ data/site.ts             ← 站点内容：5 个板块、项目、视频、GitHub 链接等（中英双语，最常改的文件）
├─ i18n.ts                  ← 界面固定文字的中英翻译、语言工具函数
├─ content/notes/*.md       ← 文章（Markdown + 公式）
│  └─ _template.md          ← 文章模板：问题 → 直觉 → 表达 → 例子 → 实验 → 参考
├─ components/
│  ├─ FrameViz.astro        ← 首页四元数驱动的交互坐标系
│  ├─ YouTube.astro         ← 点击才加载的 YouTube 播放器
│  └─ Header.astro / Footer.astro
├─ views/Home.astro, Topic.astro ← 首页 / 板块页的共用模板（中英文共用）
├─ layouts/BaseLayout.astro
├─ pages/
│  ├─ index.astro           ← 英文首页 /（默认语言）
│  ├─ zh/                   ← 中文页面 /zh/、/zh/topics/...
│  ├─ topics/[slug].astro   ← 板块页 /topics/foundations/ 等
│  └─ notes/[...slug].astro ← 文章页 /notes/<文件名>/
└─ styles/global.css        ← 颜色、字体等设计变量（含深色模式）
public/                     ← favicon、robots.txt
```

## 双语

- 英文是默认语言（`/`），中文在 `/zh/`；页头右上角的地球图标是语言切换菜单。
- 改文案：内容类在 `src/data/site.ts`（`{ en, zh }`），按钮/标题等界面文字在 `src/i18n.ts`。
- 文章正文只写一种语言（frontmatter 里的 `lang`，默认 `zh`）；可选的 `en:` 字段提供英文首页上显示的标题、简介和标签。
- 首页“About the author / 认识作者”按钮跳转到 `site.linkedin`（当前为 https://www.linkedin.com/in/danyang-huang/）。

## 日常写作

1. 复制 `src/content/notes/_template.md`，改名为英文短名，例如 `quaternion-origin.md`（文件名就是网址）。
2. 填写 frontmatter：`topic` 必须是 `foundations | transforms | perception | world-models | projects` 之一。
3. 写作时保留 `draft: true`：开发模式可以预览；正式站点只在首页显示为“撰写中”，不生成页面。
4. 写完改成 `draft: false`，提交推送即发布。
5. 有配套视频时，在 frontmatter 加 `youtubeId: xxxxxxxxxxx`，文章顶部会自动嵌入播放器并附“在 YouTube 打开”链接。

公式：行内 `$e^{i\theta}$`，块级用 `$$ ... $$`。

首页的视频卡片在 `src/data/site.ts` 的 `videos` 里，填上 `youtubeId` 后由“制作中”变为可播放。
记得把 `site.youtubeChannel` 换成你的频道地址。

## 部署到 deepinsight.space（Vercel）

1. Vercel → **Add New → Project** → 导入 `sunnypeony/deep-insight.space`。
2. Root Directory 保持 `./`（仓库根目录），Framework 自动识别为 **Astro**；
   构建命令 `npm run build`、输出目录 `dist` 均为默认值，无需修改。
3. **Settings → Domains** 添加 `deepinsight.space` 与 `www.deepinsight.space`
   （若域名还挂在旧项目上，先从旧项目移除）。
4. 之后每次推送到生产分支（默认 `main`）都会自动部署；其他分支会生成预览链接。
