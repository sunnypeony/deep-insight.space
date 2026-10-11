# Deep Insight · deepinsight.space

Start from geometry, learn how machines see the world — a personal knowledge site on coordinate transforms, quaternions, 3D perception, SLAM and world models.

A fully static site built with [Astro](https://astro.build): notes in Markdown, math rendered with KaTeX, lightweight YouTube embeds, automatic light/dark mode, and English/Chinese versions of every page.

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
src/
├─ data/site.ts                  ← site content: 5 tracks, projects, videos, profile links (bilingual; the file you'll edit most)
├─ i18n.ts                       ← UI strings in English and Chinese, plus language helpers
├─ content/notes/*.md            ← notes (Markdown + math)
│  └─ _template.md               ← note template: Question → Intuition → Formalism → Robotics → Experiment → References
├─ components/
│  ├─ FrameViz.astro             ← interactive quaternion-driven coordinate frame on the homepage
│  ├─ YouTube.astro              ← YouTube player that loads only on click
│  └─ Header.astro / Footer.astro
├─ views/Home.astro, Topic.astro ← shared homepage / track page templates (used by both languages)
├─ layouts/BaseLayout.astro
├─ pages/
│  ├─ index.astro                ← English homepage / (default language)
│  ├─ zh/                        ← Chinese pages /zh/, /zh/topics/...
│  ├─ topics/[slug].astro        ← track pages, e.g. /topics/foundations/
│  └─ notes/[...slug].astro      ← note pages /notes/<file-name>/
└─ styles/global.css             ← design tokens: colors, fonts, dark mode
public/                          ← favicon, robots.txt
```

## Languages

- English is the default language (`/`); Chinese lives under `/zh/`. The globe icon in the top-right of the header opens the language menu.
- To change copy: content goes in `src/data/site.ts` (as `{ en, zh }` pairs); UI text such as buttons and headings goes in `src/i18n.ts`.
- Each note body is written in one language (`lang` in the frontmatter, default `zh`). The optional `en:` field supplies the title, description and label shown on the English homepage and track pages.
- The "About the author" button on the homepage links to `site.linkedin` (currently https://www.linkedin.com/in/danyang-huang/).

## Writing notes

1. Copy `src/content/notes/_template.md` and give it a short English file name, e.g. `quaternion-origin.md` (the file name becomes the URL).
2. Fill in the frontmatter. `topic` must be one of `foundations | transforms | perception | world-models | projects`.
3. Keep `draft: true` while writing: drafts can be previewed in dev mode, but the production site only lists them as "Writing" on the homepage and does not generate a page.
4. When finished, set `draft: false`, then commit and push to publish.
5. If the note has a companion video, add `youtubeId: xxxxxxxxxxx` to the frontmatter; the player is embedded at the top of the note with an "Open on YouTube" link.

Math: inline `$e^{i\theta}$`, display blocks with `$$ ... $$`.

The video cards on the homepage come from `videos` in `src/data/site.ts`; adding a `youtubeId` turns an "In production" placeholder into a playable video.
Remember to replace `site.youtubeChannel` with the real channel URL.

## Deploy to deepinsight.space (Vercel)

1. In Vercel, go to **Add New → Project** and import `sunnypeony/deep-insight.space`.
2. Keep Root Directory as `./` (the repository root). The framework is detected as **Astro**;
   the build command `npm run build` and output directory `dist` are the defaults and need no changes.
3. Under **Settings → Domains**, add `deepinsight.space` and `www.deepinsight.space`
   (if the domain is still attached to an old project, remove it there first).
4. Every push to the production branch (`main` by default) deploys automatically; other branches get preview URLs.
