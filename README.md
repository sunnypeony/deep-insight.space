# Deep Insight · deepinsight.space

Start from geometry, learn how machines see the world — a personal knowledge site on coordinate transforms, quaternions, 3D perception, SLAM and world models.

A fully static site built with [Astro](https://astro.build): notes in Markdown/MDX, math rendered with KaTeX, lightweight YouTube embeds, automatic light/dark mode, and English/Chinese versions of every page.

The site is **content-driven**: every word a reader sees lives in [`content/`](content/), and the components in `src/` only render it. **[CONTENT_GUIDE.md](CONTENT_GUIDE.md)** is the interface spec — which file drives which page, the allowed frontmatter fields, and the body structure for notes, projects and the About page.

## Run locally

Requires **Node.js ≥ 22.12** (check with `node -v`; [nvm](https://github.com/nvm-sh/nvm) is recommended: `nvm install 22`).

```bash
git clone https://github.com/sunnypeony/deep-insight.space.git
cd deep-insight.space
npm install        # install dependencies
npm run dev        # dev server → http://localhost:4321 (reloads on save)
npm run build      # build static files into dist/
npm run preview    # preview the production build from dist/
npm run check      # type-check .astro and .ts files
```

## Project structure

```
content/                         ← all site content (see CONTENT_GUIDE.md)
├─ settings.yaml                 ← site name, author, LinkedIn / GitHub / YouTube links
├─ pages/{en,zh}/home.md         ← homepage copy
├─ pages/{en,zh}/about.md        ← About page
├─ topics/{en,zh}/*.md           ← knowledge-map tracks
├─ notes/{en,zh}/*.md(x)         ← notes / blog posts
├─ projects/{en,zh}/*.md(x)      ← projects
├─ videos/{en,zh}/*.md           ← video cards
├─ assets/<slug>/                ← images used in notes and projects
└─ _templates/                   ← copy-ready skeletons (ignored by the build)
src/
├─ content.config.ts             ← frontmatter schema for every content type (the enforced contract)
├─ lib/content.ts                ← content lookup: by language, translations, validation
├─ i18n.ts                       ← interface labels (buttons, badges, aria) in English and Chinese
├─ views/                        ← page templates: Home, About, Topic, Note, Project, NotesIndex
├─ pages/                        ← routes only; /zh/ mirrors the English routes
├─ components/                   ← header, footer, interactive frame, YouTube, Prose, MDX components
├─ layouts/BaseLayout.astro
└─ styles/global.css             ← design tokens: colors, fonts, dark mode
public/                          ← favicon, robots.txt
```

## Adding content

1. Pick the template from `content/_templates/` (or get a finished file from Claude chat — see the hand-off protocol in [CONTENT_GUIDE.md](CONTENT_GUIDE.md#7-hand-off-protocol)).
2. Save it at `content/<type>/<en|zh>/<slug>.md`; the file name becomes the URL.
3. Run `npm run dev` to preview (drafts are visible locally), then `npm run build` — unknown fields, bad dates or a wrong `topic` fail with a clear message.
4. Set `draft: false`, commit and push to publish.

## Deploy to deepinsight.space (Vercel)

1. In Vercel, go to **Add New → Project** and import `sunnypeony/deep-insight.space`.
2. Keep Root Directory as `./` (the repository root). The framework is detected as **Astro**;
   the build command `npm run build` and output directory `dist` are the defaults and need no changes.
3. Under **Settings → Domains**, add `deepinsight.space` and `www.deepinsight.space`
   (if the domain is still attached to an old project, remove it there first).
4. Every push to the production branch (`main` by default) deploys automatically; other branches get preview URLs.
