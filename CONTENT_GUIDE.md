# Content Guide — the interface between writing and code

This repository separates **content** from **code**:

| Role | Works on | Delivers |
|---|---|---|
| **Claude chat** — understand, break down, write | Ideas, outlines, drafts | Complete Markdown files that follow this guide |
| **Claude Code** — publish | `content/` placement, build, preview | The file committed at the right path, build passing |

The hand-off unit is **one whole file**, never loose paragraphs. A file is the right size for review, diffing, and translation, and every field in it is checked automatically at build time.

Everything a reader sees lives in `content/`. Components in `src/` only render it. If a change requires editing `src/`, it is a code change, not a content change.

---

## 1. Rules that apply to every file

1. **One file = one page in one language.** The language is the folder: `content/<type>/en/…` or `content/<type>/zh/…`.
2. **The file name is the URL.** `content/notes/en/quaternion-origin.md` → `/notes/quaternion-origin/`; the Chinese file `content/notes/zh/quaternion-origin.md` → `/zh/notes/quaternion-origin/`.
3. **Slugs are lowercase-kebab-case** (`a-z`, `0-9`, `-`). A translation uses the **same slug** in the other language folder; that is how the two versions are linked and how the language switcher finds them.
4. **Frontmatter is strict.** Only the fields listed below are allowed. A typo or unknown field (e.g. `description:` on a note) fails the build with the file name and field.
5. **Dates** are `YYYY-MM-DD`.
6. **Drafts** (`draft: true`) are visible in `npm run dev` only. In production they appear in lists as "Writing / 撰写中" with no link, and no page is generated.
7. **Files starting with `_` are ignored**, and so is everything in `content/_templates/`.
8. **Markdown (`.md`) by default.** Use **`.mdx`** only when the body uses a component (section 6).

---

## 2. Which file drives which page

| Page | URL (en / zh) | File(s) |
|---|---|---|
| Homepage | `/` · `/zh/` | `content/pages/<lang>/home.md`, plus the lists below |
| About | `/about/` · `/zh/about/` | `content/pages/<lang>/about.md` |
| All notes | `/notes/` · `/zh/notes/` | every file in `content/notes/<lang>/` |
| Note (blog post) | `/notes/<slug>/` · `/zh/notes/<slug>/` | `content/notes/<lang>/<slug>.md(x)` |
| Topic (knowledge-map track) | `/topics/<slug>/` · `/zh/topics/<slug>/` | `content/topics/<lang>/<slug>.md` |
| Project | `/projects/<slug>/` · `/zh/projects/<slug>/` | `content/projects/<lang>/<slug>.md(x)`. Only generated when the body is non-empty |
| Video cards (homepage) | — | `content/videos/<lang>/<slug>.md` |
| Site name, author, social links | every page | `content/settings.yaml` |

How each homepage section is filled:

| Homepage section | Text from | Items from |
|---|---|---|
| Hero, stats | `home.md` → `hero`, `stats` | counts of topics and notes |
| Knowledge Map | `home.md` → `sections.map` | `content/topics/<lang>/*`, ordered by `order` |
| "Every note follows the same path" | `home.md` → `sections.recipe` | `sections.recipe.steps` |
| Recent Thinking | `home.md` → `sections.notes` | the 5 newest notes by `date` |
| About card | `about.md` → `headline`, `summary`, `journey` | — |
| Projects | `home.md` → `sections.projects` | `content/projects/<lang>/*`, ordered by `order` |
| Videos | `home.md` → `sections.videos` | `content/videos/<lang>/*`, newest first |

**Missing translations:** notes, projects and videos may exist in one language only; lists in the other language show the available version with a small "中文 / English" badge. **Topics, `home.md` and `about.md` must exist in both languages**, or the build fails.

Interface text that is not content, such as button labels, "Draft", "In production" and accessibility labels, lives in `src/i18n.ts` and is changed with code.

---

## 3. Frontmatter reference

Legend: **required** · optional (default).

### 3.1 Note — `content/notes/<lang>/<slug>.md(x)`

| Field | Type | | Notes |
|---|---|---|---|
| `title` | string | **required** | Page title; also used in lists. Quote it if it contains `: ` |
| `summary` | string | **required** | 1–2 sentences. Shown under the title, in lists and as the meta description |
| `date` | date | **required** | Publication date; lists are sorted by it |
| `updated` | date | optional | Shown as "Updated …" |
| `topic` | slug | **required** | One of the topic file names: `foundations`, `transforms`, `perception`, `world-models`, `projects` |
| `tags` | string[] | optional (`[]`) | Lowercase keywords, e.g. `[quaternions, rotation]` |
| `draft` | boolean | optional (`false`) | |
| `youtubeId` | string | optional | Companion video; embedded above the body with an "Open on YouTube" link |

### 3.2 Project — `content/projects/<lang>/<slug>.md(x)`

| Field | Type | | Notes |
|---|---|---|---|
| `title` | string | **required** | Project name |
| `summary` | string | **required** | One sentence for the homepage card and page lead |
| `status` | `active` \| `done` \| `planned` | **required** | |
| `date` | date | **required** | Start date |
| `updated` | date | optional | |
| `order` | integer | optional (`100`) | Position on the homepage; smaller comes first |
| `tags` | string[] | optional (`[]`) | Shown as chips |
| `role` | string | optional | "What I did" |
| `stack` | string[] | optional (`[]`) | Tools and technologies |
| `links` | `{label, url}[]` | optional (`[]`) | Repo, paper, demo… |
| `draft` | boolean | optional (`false`) | |
| `youtubeId` | string | optional | Demo video above the body |

An empty body means the project appears only as a homepage card; write a body to get a detail page.

### 3.3 About — `content/pages/<lang>/about.md`

| Field | Type | | Notes |
|---|---|---|---|
| `page` | `about` | **required** | Literal value |
| `title` | string | **required** | Page title ("About" / "关于") |
| `description` | string | **required** | Meta description |
| `headline` | multi-line string | **required** | Big title on the homepage card and About sidebar; each line break is kept |
| `summary` | string | **required** | Short bio: homepage card text and the About page's lead paragraph |
| `journey` | string[] | **required** | The path timeline; the last item is highlighted as "now" |
| `updated` | date | optional | |

### 3.4 Homepage — `content/pages/<lang>/home.md`

| Field | Notes |
|---|---|
| `page: home` | Literal value |
| `description` | Meta description of the site |
| `hero.eyebrow` | Small caps line above the title |
| `hero.title` | Multi-line string (`\|`). Line breaks are kept; wrap the emphasized word in `*asterisks*` |
| `hero.lede` | Paragraph under the title |
| `hero.primaryCta` | Label of the "start with the map" button |
| `hero.authorCta` | Label of the button that opens LinkedIn (`settings.yaml` → `links.linkedin`) |
| `stats.tracks`, `stats.notes`, `stats.thread`, `stats.threadValue` | The three stats under the buttons |
| `sections.<map\|notes\|projects>` | `eyebrow`, `title`, optional `aside` |
| `sections.recipe` | `eyebrow`, `title`, `steps: [{step, desc}]` |
| `sections.videos` | `eyebrow`, `title`, optional `aside`, `cta` |

The body of `home.md` is not rendered.

### 3.5 Topic — `content/topics/<lang>/<slug>.md`

| Field | Type | | Notes |
|---|---|---|---|
| `title` | string | **required** | e.g. "Geometry & Math" |
| `eyebrow` | string | **required** | Short English label shown above the title (same in both languages) |
| `order` | integer | **required** | Position on the knowledge map |
| `summary` | string | **required** | |
| `keywords` | string[] | **required** | 3–5 items on the card |
| `outline` | `{title, question}[]` | optional (`[]`) | "Questions on the roadmap" on the topic page |

The optional body is shown as an introduction at the top of the topic page.

### 3.6 Video card — `content/videos/<lang>/<slug>.md`

| Field | Type | | Notes |
|---|---|---|---|
| `title` | string | **required** | |
| `summary` | string | **required** | |
| `date` | date | **required** | Cards are sorted newest first |
| `label` | string | **required** | Small label above the title |
| `youtubeId` | string | optional | Leave out while in production; a placeholder is shown |
| `note` | slug | optional | Companion note; makes the card title a link |

The body is ignored.

### 3.7 Site settings — `content/settings.yaml`

```yaml
site:
  name: Deep Insight
  domain: deepinsight.space
  tagline: Geometry · Perception · Robotics
  author: Danyang
  links:
    linkedin: https://…   # "About the author" button
    github: https://…
    youtube: https://…
    # email: you@example.com
```

---

## 4. Body structure by page type

Start body headings at `##` (the page already renders the `title` as `#`). Keep the section order; drop a section only when it truly does not apply.

### 4.1 Note (blog post / concept breakdown)

```markdown
## The question        ← 问题是什么: the single question, and why it matters
## Intuition           ← 直觉怎么理解: picture or analogy, no formulas yet
## Formalism           ← 数学或几何表达: definitions, derivation, key equations
## In robotics         ← 机器人中的例子: where it appears (SLAM, TF, calibration…)
## Experiment          ← 可视化 / 代码: figure, code, or video
## References          ← 参考资料: primary sources first
```

Chinese notes use the same structure with Chinese headings: `## 问题是什么`, `## 直觉怎么理解`, `## 数学 / 几何表达`, `## 机器人中的例子`, `## 可视化 / 代码`, `## 参考资料`.

### 4.2 Project

```markdown
## Overview            ← what it is, in one paragraph
## Problem             ← the constraint or question that motivated it
## Approach            ← system design, frames, data flow; diagrams welcome
## Results             ← numbers, figures, demo video
## Lessons learned     ← what you would do differently
```

Chinese: `## 概述` · `## 问题` · `## 方法` · `## 结果` · `## 经验与教训`.

### 4.3 About

```markdown
## Who I am
## Why this space exists
## What I'm working on
## Get in touch
```

Chinese: `## 我是谁` · `## 为什么有这个网站` · `## 正在做的事` · `## 联系我`.

### 4.4 Topic introduction (optional body)

One or two short paragraphs. What this track covers, what to read first, how it connects to the neighboring tracks.

---

## 5. Writing features

| Feature | Syntax |
|---|---|
| Inline math | `$e^{i\theta}$` |
| Display math | `$$ … $$` on their own lines |
| Code | fenced blocks with a language: <code>```python</code> |
| Tables, task lists, footnotes | GitHub-flavored Markdown |
| Link to another page | `[TF trees](/notes/ros2-tf/)`; for the Chinese version use `/zh/notes/ros2-tf/` |
| Images | Put files in `content/assets/<slug>/` and reference them relatively: `![Alt text](../../assets/<slug>/figure-1.png)` from a note or project. Images are optimized automatically; always write alt text |
| Comments | `<!-- not rendered -->` (in `.md`); in `.mdx` use `{/* … */}` |

---

## 6. MDX components (`.mdx` files only, no import needed)

| Component | Usage | Renders |
|---|---|---|
| `Callout` | `<Callout title="Why this matters" type="note">…</Callout>` · `type`: `note` (default), `tip`, `warning` | A highlighted box. Markdown and math work inside |
| `YouTube` | `<YouTube id="dQw4w9WgXcQ" title="Video title" />` | A click-to-load player with an "Open on YouTube" link, anywhere in the body |

MDX is stricter than Markdown: `{`, `}` and `<` in prose must be escaped or written inside code or math. Prefer `.md` unless you need a component.

---

## 7. Hand-off protocol

### Claude chat → (you) → Claude Code

Claude chat delivers **each file as one fenced block, preceded by its target path**:

````
File: content/notes/zh/quaternion-origin.md

```markdown
---
title: 四元数从哪里来，又为什么适合表示旋转？
summary: …
date: 2026-10-10
topic: foundations
tags: [quaternions, rotation]
draft: true
---

## 问题是什么
…
```
````

Give that block (or the saved `.md` file) to Claude Code with an instruction such as "publish this" or "add the English translation".

### What Claude Code does with it

1. Saves the file at exactly the stated path. If it already exists, it replaces the whole file; it does not merge paragraphs.
2. Places any images under `content/assets/<slug>/`.
3. Runs `npm run check` and `npm run build`. A schema error names the file and field; Claude Code fixes formatting issues and reports content questions back.
4. Previews with `npm run dev` (drafts are visible there).
5. Commits with a message like `content(notes): add quaternion-origin (zh)` and pushes.

Claude Code edits prose only when asked. Its job is placement and validation.

### Prompt to give Claude chat

> You are writing content for my website. Output complete Markdown files that follow CONTENT_GUIDE.md exactly: put the target path on a line `File: content/…` before each file, use only the frontmatter fields listed for that page type, use `YYYY-MM-DD` dates, keep the section structure for the page type, start body headings at `##`, and write math with `$…$` / `$$…$$`. One file per language; a translation uses the same slug in the other language folder. Do not output partial snippets.

(Paste or attach this guide in the same conversation.)

---

## 8. Templates

Copy-ready skeletons live in `content/_templates/`: `note.md`, `project.md`, `about.md`, `topic.md`, `video.md`. They are ignored by the build.

## 9. Common build errors

| Message | Fix |
|---|---|
| `Unrecognized key: "description"` | Field not allowed for this type. Notes use `summary`, not `description` |
| `topic "x" does not exist` | `topic` must match a file name in `content/topics/<lang>/` |
| `Topic "x" is missing its zh version` | Topics need both languages |
| `Missing content/pages/<lang>/about.md` | Home and About need both languages |
| `date: use YYYY-MM-DD` | Write dates as `2026-10-12`, not `Oct 12` |
| `use lowercase-kebab-case` | Slug fields such as `topic` and `note` must look like `world-models` |
| YAML error near a title | Quote titles that contain `: `, e.g. `title: "Gradient, divergence, curl: a local view"` |
