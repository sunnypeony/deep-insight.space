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
├─ data/site.ts             ← 站点文案、5 个板块、项目、视频、个人路径（最常改的文件）
├─ content/notes/*.md       ← 文章（Markdown + 公式）
│  └─ _template.md          ← 文章模板：问题 → 直觉 → 表达 → 例子 → 实验 → 参考
├─ components/
│  ├─ FrameViz.astro        ← 首页四元数驱动的交互坐标系
│  ├─ YouTube.astro         ← 点击才加载的 YouTube 播放器
│  └─ Header.astro / Footer.astro
├─ layouts/BaseLayout.astro
├─ pages/
│  ├─ index.astro           ← 首页
│  ├─ topics/[slug].astro   ← 板块页 /topics/foundations/ 等
│  └─ notes/[...slug].astro ← 文章页 /notes/<文件名>/
└─ styles/global.css        ← 颜色、字体等设计变量（含深色模式）
public/                     ← favicon、CNAME、robots.txt
```

## 日常写作

1. 复制 `src/content/notes/_template.md`，改名为英文短名，例如 `quaternion-origin.md`（文件名就是网址）。
2. 填写 frontmatter：`topic` 必须是 `foundations | transforms | perception | world-models | projects` 之一。
3. 写作时保留 `draft: true`：开发模式可以预览；正式站点只在首页显示为“撰写中”，不生成页面。
4. 写完改成 `draft: false`，提交推送即发布。
5. 有配套视频时，在 frontmatter 加 `youtubeId: xxxxxxxxxxx`，文章顶部会自动嵌入播放器并附“在 YouTube 打开”链接。

公式：行内 `$e^{i\theta}$`，块级用 `$$ ... $$`。

首页的视频卡片在 `src/data/site.ts` 的 `videos` 里，填上 `youtubeId` 后由“制作中”变为可播放。
记得把 `site.youtubeChannel` 换成你的频道地址。

## 部署到 deepinsight.space

### 方案 A：GitHub Pages（仓库已配置好）

1. 将代码合并到 `main` 分支。
2. GitHub 仓库 → **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
   之后每次推送到 `main`，`.github/workflows/deploy.yml` 会自动构建并发布。
3. 同一页面 **Custom domain** 填 `deepinsight.space`，保存后勾选 **Enforce HTTPS**（证书签发可能需要几分钟到一小时）。
4. 在域名注册商的 DNS 设置中添加：

   | 类型  | 主机 | 值 |
   |-------|------|----|
   | A     | @    | 185.199.108.153 |
   | A     | @    | 185.199.109.153 |
   | A     | @    | 185.199.110.153 |
   | A     | @    | 185.199.111.153 |
   | CNAME | www  | sunnypeony.github.io |

`public/CNAME` 已写入 `deepinsight.space`。

### 方案 B：Cloudflare Pages / Vercel / Netlify

导入 GitHub 仓库，构建命令 `npm run build`，输出目录 `dist`，Node 版本 22，然后在平台里绑定自定义域名，按提示修改 DNS。
