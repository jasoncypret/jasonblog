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

This site is configured to deploy to Netlify. The build command is set in `netlify.toml`.

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
