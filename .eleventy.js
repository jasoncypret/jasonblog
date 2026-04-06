const { DateTime } = require("luxon");
const { execSync } = require("child_process");
const path = require("path");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const rssPlugin = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItEleventyImg = require("markdown-it-eleventy-img");

/** Same rules as the Nunjucks `slug` filter — used to dedupe tags that differ only by case/spacing. */
function slugify(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

module.exports = function(eleventyConfig) {
  // Compile SCSS after every build (so dev --serve has CSS and build has CSS)
  eleventyConfig.on("eleventy.after", () => {
    const cwd = process.cwd();
    const input = path.join(cwd, "src/stylesheets/site.css.scss");
    const output = path.join(cwd, "_site/stylesheets/site.css");
    execSync(`npx sass "${input}" "${output}"`, { stdio: "inherit", cwd });
  });

  // Watch stylesheets so SCSS changes trigger a rebuild (and thus recompile)
  eleventyConfig.addWatchTarget("src/stylesheets/");

  // Directories
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/javascripts");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  // Article media files (images, videos in article subdirectories)
  eleventyConfig.addPassthroughCopy("src/articles/**/*.{webp,jpg,jpeg,png,gif,svg,mp4,mov,pdf}");

  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(rssPlugin);

  // Markdown configuration with image processing
  const md = markdownIt({
    html: true,         // Allow HTML in markdown
    typographer: true,  // Smartypants equivalent
    linkify: true,
  });

  md.use(markdownItEleventyImg, {
    imgOptions: {
      widths: [300, 600, null],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/media/optimized/",
      urlPath: "/media/optimized/",
    },
    globalAttributes: {
      loading: "lazy",
      class: "lazyload",
      sizes: "(max-width: 575px) 94vw, 700px",
    },
    resolvePath: function(imagePath, inputPath) {
      const path = require('path');
      // Handle absolute paths starting with /articles/
      if (imagePath.startsWith('/articles/')) {
        // Remove leading slash and resolve from src directory
        return path.join(process.cwd(), 'src', imagePath.substring(1));
      }
      // Handle other absolute paths starting with /
      if (imagePath.startsWith('/')) {
        // Remove leading slash and resolve from src directory
        return path.join(process.cwd(), 'src', imagePath.substring(1));
      }
      // Handle relative paths starting with "articles/" - resolve from src
      if (imagePath.startsWith('articles/')) {
        return path.join(process.cwd(), 'src', imagePath);
      }
      // For other relative paths, resolve relative to the article directory
      // inputPath might be a string or an object with inputPath property
      const actualInputPath = typeof inputPath === 'string' ? inputPath : (inputPath?.inputPath || inputPath?.page?.inputPath || '');
      if (!actualInputPath) {
        // Fallback: resolve from src/articles
        return path.join(process.cwd(), 'src', 'articles', imagePath);
      }
      const articleDir = path.dirname(actualInputPath);
      return path.resolve(articleDir, imagePath);
    },
  });

  eleventyConfig.setLibrary("md", md);

  // Collections
  eleventyConfig.addCollection("articles", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/articles/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Tag collection (one entry per slug so "AI" and "ai" do not emit duplicate tag pages)
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagBySlug = new Map();
    collectionApi.getAll().forEach(function(item) {
      if ("tags" in item.data) {
        let tags = item.data.tags;
        if (typeof tags === "string") {
          tags = [tags];
        }
        if (Array.isArray(tags)) {
          tags.forEach((tag) => {
            const key = slugify(tag);
            if (key && !tagBySlug.has(key)) {
              tagBySlug.set(key, tag);
            }
          });
        }
      }
    });
    return Array.from(tagBySlug.values()).sort();
  });

  // Filter by tag (match by slug so pages line up with deduped tagList)
  eleventyConfig.addFilter("filterByTag", function(articles, tag) {
    const needle = slugify(tag);
    return articles.filter((article) => {
      const tags = article.data.tags || [];
      const tagArray = Array.isArray(tags) ? tags : [tags];
      return tagArray.some((t) => slugify(t) === needle);
    });
  });

  // Calendar/archive collection grouped by year
  eleventyConfig.addCollection("articlesByYear", function(collectionApi) {
    const articles = collectionApi.getFilteredByGlob("src/articles/**/*.md")
      .sort((a, b) => b.date - a.date);
    
    const grouped = {};
    articles.forEach(article => {
      const year = new Date(article.date).getFullYear();
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(article);
    });
    
    return grouped;
  });

  // Get years list for calendar
  eleventyConfig.addCollection("years", function(collectionApi) {
    const articles = collectionApi.getFilteredByGlob("src/articles/**/*.md");
    const yearSet = new Set();
    articles.forEach(article => {
      const year = new Date(article.date).getFullYear();
      yearSet.add(year);
    });
    return Array.from(yearSet).sort((a, b) => b - a);
  });

  // Filters
  eleventyConfig.addFilter("dateFormat", function(date, format) {
    // Match current format: "JUN 30TH 2025"
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const d = new Date(date);
    const day = d.getDate();
    const suffix = day === 1 ? 'ST' : day === 2 ? 'ND' : day === 3 ? 'RD' : 'TH';
    return `${months[d.getMonth()]} ${day}${suffix} ${d.getFullYear()}`;
  });

  eleventyConfig.addFilter("dateISO", function(date) {
    const d =
      date === "now" || date === "Now"
        ? new Date()
        : date instanceof Date
          ? date
          : new Date(date);
    return d.toISOString();
  });

  eleventyConfig.addFilter("dateReadable", function(date) {
    return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat('MMMM d, yyyy');
  });

  eleventyConfig.addFilter("date", function(date, format) {
    const d =
      date === "now" || date === "Now"
        ? new Date()
        : date instanceof Date
          ? date
          : new Date(date);
    if (format && format.includes("%Y-%m-%d")) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return d.toISOString();
  });

  eleventyConfig.addFilter("age", function(birthDate, currentDate) {
    const bd = new Date(birthDate);
    const d = currentDate ? new Date(currentDate) : new Date();
    let age = d.getFullYear() - bd.getFullYear();
    const monthDiff = d.getMonth() - bd.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && d.getDate() < bd.getDate())) {
      age--;
    }
    return age;
  });

  eleventyConfig.addFilter("slug", slugify);

  eleventyConfig.addFilter("find", function(array, key, value) {
    if (!array) return null;
    return array.find(item => item[key] === value) || null;
  });

  eleventyConfig.addFilter("startsWith", function(str, prefix) {
    if (!str) return false;
    return str.startsWith(prefix);
  });

  eleventyConfig.addFilter("keys", function(obj) {
    if (!obj || typeof obj !== "object") return [];
    return Object.keys(obj);
  });

  eleventyConfig.addFilter("videoPoster", function(src, poster) {
    if (poster) return poster;
    if (!src || typeof src !== "string") return "";
    return src.replace(".mp4", "_thumb.webp");
  });

  eleventyConfig.addFilter("replace", function(str, search, replacement) {
    if (!str || typeof str !== "string") return "";
    return str.split(search).join(replacement);
  });

  eleventyConfig.addFilter("limit", function(array, n) {
    if (!array) return [];
    return array.slice(0, n);
  });

  eleventyConfig.addFilter("offset", function(array, n) {
    if (!array) return [];
    return array.slice(n);
  });

  // Shortcodes
  eleventyConfig.addShortcode("image", async function(src, alt, classes = "") {
    const Image = require("@11ty/eleventy-img");
    let metadata = await Image(src, {
      widths: [300, 600, null],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/media/optimized/",
      urlPath: "/media/optimized/",
    });
    let imageAttributes = { 
      alt, 
      loading: "lazy", 
      class: `lazyload ${classes}`.trim() 
    };
    return Image.generateHTML(metadata, imageAttributes);
  });

  // Permalinks are handled in frontmatter, no global data needed

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html", "xml"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
