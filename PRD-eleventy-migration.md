# PRD: Migrate jasoncypret.com from Middleman to Eleventy + Netlify

## Goal

Migrate the **entire** jasoncypret.com from Middleman (Ruby) to Eleventy (Node.js) and deploy on Netlify. This is a full migration — not a hybrid. All pages (homepage, blog, portfolio case studies, resume) move to Eleventy.

The primary motivation is making blogging easier and enabling future automation (chat-to-post, scheduled publishing). The portfolio and other non-blog pages migrate too but are maintained manually.

### Why Full Migration Works

The portfolio's ERB partials are just HTML + template includes with variables — they convert directly to Nunjucks. The "complicated" part was the image/video processing, but those scripts already produced all the `_thumb.webp`, `_mobile.webp`, `_mobile.mp4` variants that are committed in the repo. The templates just reference those processed files. No build-time portfolio image processing is needed — only blog images need build-time processing (handled by Eleventy Image).

Portfolio image/video processing scripts are retained as local Node.js scripts for future portfolio updates.

## Background

### Current Stack
- **SSG:** Middleman 4.5.1 (Ruby 3.2.2)
- **Hosting:** GitHub Pages (gh-pages branch via GitHub Actions)
- **Domain:** jasoncypret.com (CNAME)
- **Markdown engine:** Redcarpet (fenced code blocks, smartypants, tables)
- **CSS:** SCSS with a token-based design system (Montserrat font, Animate.css, custom mixins)
- **JS:** Vanilla JS (344 lines) — lightbox, IntersectionObserver animations, lazy video loading
- **Image processing:** MiniMagick (Ruby) — WebP conversion, responsive thumbnails, video transcoding via ffmpeg
- **SEO:** JSON-LD structured data, Open Graph, Twitter Cards, sitemap, RSS feed
- **Blog:** middleman-blog with pagination (10/page), tag pages, calendar archive

### Current Content Inventory
- **Homepage** (`index.html.erb`) — hero, summary, portfolio showcases (Power, BoxBoard, BloomBoard, Brainspace), features, speaking
- **Blog** (`blog/index.html.erb`) — featured (first 2) + grid layout, pagination, tag/calendar browse
- **Blog posts** (~14 articles in `source/articles/`) — markdown with YAML frontmatter
- **Company case studies** (`source/companies/`) — Power (5 sections with partials), BloomBoard
- **Resume** (`resume.html.erb`) — data-driven from `data/site.json`
- **Other** — calendar archive, tag pages, RSS feed, sitemap, icons/buttons showcases
- **Media** — images in `source/media/`, videos in `source/media/companies/`
- **Data** — `data/site.json` (navigation, work experience, social links, downloads)

### Current Image Processing (what happens automatically today)
1. **Company images:** JPG/PNG → WebP conversion, 500x600 thumbnails (dev) / 400x500 (build), mobile 300x300 variants
2. **Article images:** JPG/PNG → WebP conversion (originals backed up to ~/Desktop)
3. **Videos:** MOV/M4V/AVI → MP4 via ffmpeg, thumbnail extraction at 1-second mark, mobile video variants (720p, 800k bitrate)
4. All processing runs on `middleman server` start and during `middleman build`

---

## Target Stack

- **SSG:** Eleventy (latest stable)
- **Hosting:** Netlify (free tier)
- **Templating:** Nunjucks (replaces ERB)
- **CSS:** SCSS (same design system, compiled via Eleventy plugin or sass CLI)
- **JS:** Same vanilla JS (no framework change needed)
- **Image processing (blog):** Eleventy Image plugin — WebP conversion and responsive sizing at build time
- **Image processing (portfolio):** Retained as local Node.js scripts (run manually, not part of build)
- **Deployment:** Git push → Netlify auto-build

---

## Scope

### In Scope
- Full migration of all pages (homepage, blog, portfolio, resume, case studies)
- Port ERB templates to Nunjucks
- Port SCSS build pipeline
- Migrate blog with Eleventy collections (tags, pagination, calendar)
- Blog image processing via Eleventy Image (automatic WebP + responsive at build time)
- SEO parity (JSON-LD, OG tags, Twitter Cards, sitemap, RSS, canonical URLs)
- Netlify deployment with custom domain
- Retain existing URL structure for SEO (redirects where needed)
- Retain local image/video processing scripts for portfolio use

### Out of Scope (Future Phase)
- Chat-to-post automation / API endpoint
- CMS integration (Decap CMS or similar)
- Redesign of any pages
- New features or content

---

## Migration Plan

### Phase 1: Project Setup

1. **Initialize Eleventy project** in the existing repo (or a new branch)
   - `package.json` with eleventy, `@11ty/eleventy-img`, `sass`, `eleventy-plugin-rss`, `eleventy-plugin-syntaxhighlight`
   - `.eleventy.js` config file
   - Set input directory to `src/` (new) and output to `_site/`
2. **Directory structure:**
   ```
   jasonblog/
   ├── src/
   │   ├── _includes/          # Nunjucks layouts and partials
   │   │   ├── layouts/
   │   │   │   ├── base.njk    # Main HTML wrapper (replaces layout.erb)
   │   │   │   ├── post.njk    # Blog post layout (replaces post.erb)
   │   │   │   └── page.njk    # Generic page layout
   │   │   ├── partials/
   │   │   │   ├── head.njk
   │   │   │   ├── nav.njk
   │   │   │   ├── post-header.njk
   │   │   │   └── js-includes.njk
   │   │   └── homepage/
   │   │       ├── hero.njk
   │   │       ├── quick-summary.njk
   │   │       ├── showcase-power.njk
   │   │       ├── showcase-box.njk
   │   │       ├── showcase-bloom.njk
   │   │       ├── showcase-brain.njk
   │   │       ├── my-features.njk
   │   │       └── speaking.njk
   │   ├── articles/            # Blog posts (markdown, copied from source/articles/)
   │   ├── companies/           # Company case study pages (Nunjucks)
   │   ├── blog/
   │   │   └── index.njk        # Blog listing page
   │   ├── media/               # All images, videos, fonts (copied as-is)
   │   ├── stylesheets/         # SCSS files (same structure)
   │   ├── javascripts/
   │   │   └── site.js          # Same JS file
   │   ├── index.njk            # Homepage
   │   ├── resume.njk           # Resume page
   │   ├── feed.njk             # RSS feed template
   │   ├── robots.txt
   │   └── CNAME
   ├── _data/
   │   └── site.json            # Same data file (moved from data/)
   ├── scripts/                 # Local-only processing scripts (not part of build)
   │   ├── process-portfolio-images.js   # Node.js port of Rake image tasks
   │   └── process-videos.js             # Node.js port of video transcoding
   ├── .eleventy.js             # Eleventy config
   ├── package.json
   ├── netlify.toml             # Netlify config
   └── .nvmrc                   # Node version
   ```

3. **Netlify config** (`netlify.toml`):
   ```toml
   [build]
     command = "npx @11ty/eleventy"
     publish = "_site"

   [build.environment]
     NODE_VERSION = "20"
   ```

### Phase 2: Core Templates

4. **Port the base layout** (`layout.erb` → `base.njk`)
   - HTML wrapper, head partial include, nav partial, yield → `{{ content | safe }}`, JS includes
   - The layout is only 9 lines of ERB — straightforward conversion

5. **Port the head partial** (`_head.html.erb` → `head.njk`)
   - Dynamic title: `{{ title }} - Jason Cypret` or fallback
   - Meta tags using Nunjucks variables from frontmatter
   - Open Graph and Twitter Card meta from frontmatter data
   - JSON-LD structured data — use Nunjucks conditionals (if `date` exists → BlogPosting, else → Person)
   - Canonical URLs using Eleventy's `page.url`
   - Same CDN links (Animate.css, Google Fonts)
   - RSS alternate link

6. **Port the nav partial** — direct HTML conversion, replace `<%= link_to %>` with `<a href="">`

7. **Port the post layout** (`post.erb` → `post.njk`)
   - Include syntax highlighting CSS (use eleventy-plugin-syntaxhighlight with Prism or similar theme to match ThankfulEyes)
   - Post header partial
   - `{{ content | safe }}` for article body

### Phase 3: Blog Migration

8. **Copy blog posts** from `source/articles/` to `src/articles/`
   - Remove date prefix from filenames (Eleventy uses frontmatter date, not filename)
   - Rename `.html.markdown` extension to `.md`
   - Frontmatter stays as-is — it's already valid YAML
   - Image paths in frontmatter and markdown body need updating to reflect new media path structure

9. **Configure blog collection** in `.eleventy.js`:
   ```js
   eleventyConfig.addCollection("articles", function(collectionApi) {
     return collectionApi.getFilteredByGlob("src/articles/**/*.md")
       .sort((a, b) => b.date - a.date);
   });
   ```

10. **Blog listing page** (`blog/index.njk`)
    - Replicate the current layout: first 2 posts featured (col-md-6), remaining in 3-column grid (col-lg-4 col-md-6)
    - Pagination using Eleventy's built-in pagination (8 per page, matching current config)
    - Tag links and date formatting
    - "Browse Content" sidebar with calendar and tag links

11. **Tag pages** — use Eleventy's tag collection pattern to generate `/tags/{tag}/` pages

12. **Calendar/archive pages** — create collection grouped by year

13. **RSS feed** — use `eleventy-plugin-rss` with a `feed.njk` template

14. **Sitemap** — generate `sitemap.xml` using a Nunjucks template iterating all pages

15. **Permalink structure** — match existing URLs:
    - Blog posts: `/{title}/index.html` (produces `/{title}/` with directory indexes, matching current `{title}.html` with Middleman's directory_indexes)
    - Blog listing: `/blog/`
    - Tags: `/tags/{tag}/`

### Phase 4: Blog Image Processing

16. **Eleventy Image for blog posts** — create a shortcode or Nunjucks filter:
    ```js
    // In .eleventy.js
    const Image = require("@11ty/eleventy-img");

    eleventyConfig.addShortcode("image", async function(src, alt, sizes) {
      let metadata = await Image(src, {
        widths: [300, 600, null],  // mobile, desktop, original
        formats: ["webp", "jpeg"],
        outputDir: "./_site/media/optimized/",
        urlPath: "/media/optimized/",
      });
      // Return responsive <picture> element
      let imageAttributes = { alt, loading: "lazy", class: "lazyload" };
      return Image.generateHTML(metadata, imageAttributes);
    });
    ```
    - This replaces the MiniMagick WebP conversion and thumbnail generation for article images
    - Blog authors can drop in JPG/PNG files and the build handles the rest
    - Existing WebP files in articles pass through as-is

17. **Update image references in blog posts**
    - Current: `![alt](articles/slug/image.webp)`
    - New: Use the `{% image %}` shortcode OR keep markdown images and process them with an Eleventy transform
    - Decision: if keeping markdown syntax is preferred for automation compatibility, use an Eleventy plugin like `markdown-it-eleventy-img` to automatically process markdown images through Eleventy Image

### Phase 5: Homepage & Portfolio Pages

18. **Homepage** (`index.njk`)
    - Port each partial from ERB to Nunjucks
    - Homepage currently shows portfolio showcases — these are static HTML with image paths, convert `<%= %>` to Nunjucks `{{ }}`
    - Recent blog posts on homepage: if desired, pull from `collections.articles` and render the latest 2-3

19. **Company case study pages** (`companies/power.njk`, `companies/bloomboard.njk`)
    - Port ERB partials to Nunjucks includes
    - These pages reference pre-processed images/videos in `media/companies/` — no build-time processing needed
    - Lightbox JS, lazy loading, video playback all remain the same (vanilla JS)

20. **Resume page** (`resume.njk`)
    - Data-driven from `_data/site.json` — use Nunjucks `{% for %}` loops instead of ERB `<% %>`

21. **Other pages** — icons showcase, buttons showcase, etc. — straightforward ERB → Nunjucks conversion

### Phase 6: SCSS & Assets

22. **SCSS compilation** — options:
    - **Option A (recommended):** Use `sass` CLI in the Netlify build command: `sass src/stylesheets/site.scss _site/stylesheets/site.css && npx eleventy`
    - **Option B:** Use an Eleventy plugin like `eleventy-sass`
    - Keep the entire SCSS directory structure as-is (tokens, mixins, components, utilities, views)

23. **Autoprefixer** — add `postcss` + `autoprefixer` as a post-build step, or use `eleventy-postcss` plugin

24. **Fonts** — copy `src/fonts/` to `_site/fonts/` via Eleventy passthrough copy

25. **JavaScript** — copy `site.js` via passthrough copy. No changes needed to the JS itself.

26. **Media passthrough** — configure Eleventy to copy `src/media/` to `_site/media/`:
    ```js
    eleventyConfig.addPassthroughCopy("src/media");
    eleventyConfig.addPassthroughCopy("src/fonts");
    eleventyConfig.addPassthroughCopy("src/javascripts");
    eleventyConfig.addPassthroughCopy("src/CNAME");
    ```

### Phase 7: Markdown Configuration

27. **Markdown engine** — configure `markdown-it` to match Redcarpet behavior:
    ```js
    const markdownIt = require("markdown-it");
    const md = markdownIt({
      html: true,         // Allow HTML in markdown
      typographer: true,  // Smartypants equivalent
      linkify: true,
    });
    eleventyConfig.setLibrary("md", md);
    ```
    - Add `markdown-it-anchor` for heading anchors if desired
    - Tables are supported by default in markdown-it

28. **Syntax highlighting** — `@11ty/eleventy-plugin-syntaxhighlight` with Prism
    - Find or create a Prism theme that approximates Rouge's ThankfulEyes theme
    - Apply to fenced code blocks in posts

### Phase 8: Eleventy Helpers & Filters

29. **Port Middleman helpers to Eleventy filters/shortcodes:**

    | Middleman Helper | Eleventy Equivalent |
    |---|---|
    | `image_tag(path, params)` — adds `lazyload` class | `{% image %}` shortcode (Phase 4) or a Nunjucks filter that outputs `<img>` with `class="lazyload"` |
    | `process_image(path, options)` | Replaced by Eleventy Image plugin |
    | `age_in_completed_years(bd, d)` | Eleventy filter: `eleventyConfig.addFilter("age", (bd) => { ... })` |
    | `link_to(text, url, options)` | Plain `<a>` tags in Nunjucks (no helper needed) |
    | `partial("path")` | `{% include "path.njk" %}` |
    | `data.site.*` | `{{ site.* }}` (auto-loaded from `_data/site.json`) |
    | `current_page.data.*` | `{{ title }}`, `{{ description }}`, etc. (frontmatter variables) |
    | `current_page.url` | `{{ page.url }}` |
    | `page_classes` | Custom filter if needed, or just hardcode body classes |

30. **Date formatting filter:**
    ```js
    eleventyConfig.addFilter("dateFormat", (date, format) => {
      return new Intl.DateTimeFormat('en-US', { ... }).format(date);
    });
    ```
    - Current format in blog listing: `article.date.strftime('%b %eth %Y').upcase` → `"JUN 30TH 2025"`

### Phase 9: Local Portfolio Scripts

31. **Port Rake image tasks to Node.js scripts** in `scripts/` directory:
    - `scripts/process-portfolio-images.js` — uses `sharp` (Node.js) instead of MiniMagick (Ruby)
      - WebP conversion for company images
      - Thumbnail generation (600x500 desktop, 300x300 mobile)
      - Same quality settings (95% WebP, 85% mobile)
    - `scripts/process-videos.js` — wraps ffmpeg CLI calls
      - MOV/M4V/AVI → MP4 conversion
      - Thumbnail extraction at 1-second mark
      - Mobile video variants (720p, 800k bitrate)
    - Add npm scripts in `package.json`:
      ```json
      {
        "scripts": {
          "build": "sass src/stylesheets/site.scss _site/stylesheets/site.css && npx eleventy",
          "dev": "npx eleventy --serve",
          "images:portfolio": "node scripts/process-portfolio-images.js",
          "videos:process": "node scripts/process-videos.js"
        }
      }
      ```
    - These are **not** run during Netlify builds — only locally when updating portfolio content

### Phase 10: Deployment & DNS

32. **Netlify setup:**
    - Connect repo to Netlify
    - Build command: `npm run build`
    - Publish directory: `_site`
    - Set `NODE_VERSION=20` environment variable
    - Add custom domain `jasoncypret.com`
    - Enable Netlify DNS or configure existing DNS to point to Netlify

33. **Redirects** — create `_redirects` file or use `netlify.toml` for any URL changes:
    - If permalink structure changes at all, add 301 redirects for existing indexed URLs
    - Redirect `/feed.xml` if path changes

34. **Remove old GitHub Pages setup:**
    - Remove `.github/workflows/deploy.yml`
    - Remove `Rakefile` (or keep alongside new scripts if Ruby tasks are still useful during transition)
    - Remove `Gemfile`, `Gemfile.lock`, `.ruby-version`
    - Clean up `.tool-versions` (remove ruby, keep nodejs)

### Phase 11: Validation & QA

35. **URL parity check** — crawl the current live site and verify every URL resolves on the new build
36. **SEO check:**
    - Verify JSON-LD output on homepage and blog posts
    - Verify Open Graph and Twitter Card meta tags
    - Verify sitemap.xml includes all pages
    - Verify RSS feed validates
    - Verify canonical URLs are correct
37. **Visual regression** — compare key pages side-by-side:
    - Homepage
    - Blog listing (page 1 and page 2)
    - A blog post with images and code blocks
    - A company case study page (Power)
    - Resume page
38. **Functionality check:**
    - Lightbox opens/closes, keyboard navigation works
    - Scroll animations fire correctly
    - Video lazy loading and playback work
    - Pagination links work
    - Tag pages render correctly
    - Mobile responsive behavior unchanged

---

## Future: Automation Hook Points

Once the migration is complete, the Eleventy + Netlify stack enables:

1. **Netlify Build Hook** — a webhook URL that triggers a rebuild. Any external service can POST to it.
2. **Chat-to-post flow:**
   - A Netlify Function (or external service like n8n) accepts a POST with `{ title, tags, summary, content, image_url }`
   - It creates a markdown file in the `src/articles/` directory format
   - Commits to the repo via GitHub API
   - Netlify auto-deploys
3. **Decap CMS** (optional) — add `admin/` directory with config for a browser-based editor at `jasoncypret.com/admin`
4. **Scheduled posts** — Netlify can be triggered on a cron schedule to rebuild and publish future-dated posts

These are **not part of this migration** but the architecture supports them with minimal additional work.

---

## Key Decisions to Make During Implementation

1. **Markdown images:** Use `{% image %}` shortcode (more control, requires updating all posts) vs. `markdown-it-eleventy-img` plugin (processes standard `![alt](src)` syntax automatically, less post editing)?
2. **SCSS build:** Eleventy plugin vs. sass CLI in build command?
3. **Syntax highlighting theme:** Find closest Prism match to ThankfulEyes, or pick a new theme?
4. **Asset hashing:** Eleventy doesn't have built-in asset hashing like Middleman. Options: use a plugin, or skip it since Netlify handles cache headers well.
5. **Keep Ruby scripts?** Port to Node.js (cleaner, single runtime) or keep Rake tasks (already working, less migration work)?

---

## Dependencies

```json
{
  "@11ty/eleventy": "^3.x",
  "@11ty/eleventy-img": "^4.x",
  "@11ty/eleventy-plugin-rss": "^2.x",
  "@11ty/eleventy-plugin-syntaxhighlight": "^5.x",
  "markdown-it": "^14.x",
  "sass": "^1.x",
  "sharp": "^0.33.x"
}
```

Optional:
- `postcss` + `autoprefixer` (if CSS prefixing is needed)
- `markdown-it-eleventy-img` (if auto-processing markdown images)
- `@11ty/eleventy-navigation` (if adding breadcrumbs or structured nav)
