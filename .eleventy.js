const util = require("util");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBetterSlug = require("@borisschapira/eleventy-plugin-better-slug");
const excerpt = require("eleventy-plugin-excerpt");
const htmlmin = require("html-minifier");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const uslug = require("uslug");

const optimizeImages = require("./tools/optimize-images");
const optimizeCSS = require("./tools/optimize-css");

const devMode = process.argv.includes("--serve");

/**
 * @param {import('@11ty/eleventy/src/EleventyConfig')} eleventyConfig Test
 */
module.exports = function (eleventyConfig) {
  // Optimize all of the images automatically into webp
  optimizeImages();

  // Only optimize CSS if dev mode
  if (devMode == false) {
    // Optimize all of the css automatically
    optimizeCSS();
  }

  // Add custom markdown-it rendering
  let markdownLib = markdownIt({
    html: true,
    // Automatically convert URLs into <a>
    linkify: true,
  })
    // Add #anchors for titles with a slug (use uslug so no special characters are included)
    .use(markdownItAnchor, { 
      slugify: (s) => uslug(s),
    });

  // Register the custom markdownIt instance into eleventy
  eleventyConfig.setLibrary("md", markdownLib);

  // Add extra plugins
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginBetterSlug);
  eleventyConfig.addPlugin(excerpt);

  // Auto-copy CNAME and js files
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/js/");

  // Stringify passed JSON with JsonStringify filter
  eleventyConfig.addFilter("JsonStringify", function (value) {
    return util.inspect(value);
  });

  eleventyConfig.addFilter("isoDateFormat", function (date) {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return date.toISOString().split("T")[0];
  });

  // Format date with dateFormat filter
  eleventyConfig.addFilter("dateFormat", function (date) {
    var monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return `${
      monthNames[date.getUTCMonth()]
    } ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  });

  // Automatically minify output html files
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (devMode == false) {
      if (outputPath.endsWith(".html")) {
        let minified = htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        });
        return minified;
      }
    }

    return content;
  });

  const formats = ["njk", "html", "md"];

  // Do not optimize CSS if dev mode, want to watch for them
  if (devMode) formats.push("css");

  return {
    dir: {
      input: "src",
      output: "docs",
    },
    templateFormats: formats,
  };
};
