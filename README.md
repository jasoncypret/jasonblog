# Jason Cypret Blog

Personal blog and portfolio site built with Eleventy.

## Setup

This project uses [asdf](https://asdf-vm.com/) for version management and [yarn](https://yarnpkg.com/) for package management.

### Prerequisites

- [asdf](https://asdf-vm.com/) installed
- [asdf-nodejs](https://github.com/asdf-vm/asdf-nodejs) plugin installed
- [yarn](https://yarnpkg.com/) installed (via asdf or system)

### Installation

1. Install Node.js version (managed by asdf):
   ```bash
   asdf install
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

## Development

Start the development server:
```bash
yarn dev
```

The site will be available at `http://localhost:8080`

## Building

Build the site for production:
```bash
yarn build
```

The output will be in the `_site/` directory.

## Portfolio Image Processing

Process portfolio images (local-only, not part of build):
```bash
yarn images:portfolio
```

Process videos:
```bash
yarn videos:process
```

## Deployment

### Pre-deploy Checklist

Before merging to `master` and going live on Netlify, complete these steps:

**1. Disable the old GitHub Pages workflow**

The file `.github/workflows/deploy.yml` runs a Ruby/Middleman build on every push to `master`. It must be removed (or the branch condition changed) before merge — otherwise it will fail and compete with Netlify.

```bash
rm .github/workflows/deploy.yml
git add -A && git commit -m "Remove old GitHub Pages deploy workflow"
```

**2. Visual QA — compare key pages against production**

Run `yarn dev` locally and check each page side-by-side with [jasoncypret.com](https://jasoncypret.com):

- [ ] Homepage (`/`) — hero, portfolio showcases, speaking section
- [ ] Blog listing (`/blog/`) — featured posts, grid, pagination
- [ ] A blog post with images (e.g. `/gartner-2024-day-2/`)
- [ ] A blog post with a YouTube embed (e.g. `/taskk-pitch-to-austin-ventures/`)
- [ ] A blog post with code blocks
- [ ] Tags index (`/tags/`)
- [ ] A tag show page (e.g. `/tags/ux/`)
- [ ] Calendar (`/calendar/`)
- [ ] Resume (`/resume/`)
- [ ] Power case study (`/companies/power/`)
- [ ] BloomBoard case study (`/companies/bloomboard/`)

**3. Functionality smoke test**

- [ ] Lightbox opens/closes on portfolio images
- [ ] Scroll animations fire correctly on homepage
- [ ] Video lazy loading works on company pages
- [ ] Pagination links work (`/blog/` → page 2)
- [ ] Mobile responsive layout on all key pages

**4. SEO/feed check**

- [ ] `/feed.xml` is valid Atom feed
- [ ] `/sitemap.xml` lists all pages
- [ ] Open Graph meta tags present on blog posts (check `<head>` source)
- [ ] JSON-LD structured data on homepage and posts

---

### Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Connect your GitHub account and select this repo (`jason_cypret/jasonblog`)
3. Netlify will auto-detect `netlify.toml` — verify these settings:
   - **Build command:** `yarn build`
   - **Publish directory:** `_site`
   - **Node version:** `20.18.0` (set in `netlify.toml`)
4. Click **Deploy site** — first deploy will take a few minutes

### Configure Custom Domain

1. In Netlify site settings → **Domain management** → **Add custom domain**
2. Enter `jasoncypret.com`
3. **Option A — Netlify DNS (recommended):** Update your domain registrar's nameservers to Netlify's. Netlify handles SSL automatically.
4. **Option B — External DNS:** Add a CNAME record pointing `www` to your Netlify subdomain (e.g. `your-site.netlify.app`), and an A record for the apex domain pointing to Netlify's load balancer IPs.
5. SSL certificate will auto-provision via Let's Encrypt once DNS propagates (~5 min to 48 hrs)

### After Deploy

- Confirm `https://jasoncypret.com` loads the new Eleventy site
- Test a few article URLs to confirm no broken links
- Submit updated sitemap to Google Search Console: `https://jasoncypret.com/sitemap.xml`

## Project Structure

```
src/
├── _includes/        # Layouts and partials
├── _data/            # Global data files
├── articles/         # Blog posts (markdown)
├── blog/             # Blog listing page
├── companies/         # Company case study pages
├── tags/             # Tag pages
├── media/            # Images and videos
├── stylesheets/      # SCSS files
└── javascripts/      # JavaScript files
```

## Tech Stack

- **Static Site Generator**: Eleventy
- **Templating**: Nunjucks
- **Styling**: SCSS
- **Image Processing**: Sharp (local scripts), Eleventy Image (blog posts)
- **Syntax Highlighting**: Prism
- **Package Manager**: Yarn
- **Version Management**: asdf
