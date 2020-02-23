const util = require('util');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBetterSlug = require("@borisschapira/eleventy-plugin-better-slug");
const excerpt = require('eleventy-plugin-excerpt');
const htmlmin = require("html-minifier");

const optimizeImages = require('./tools/optimize-images');
const optimizeCSS = require('./tools/optimize-css');

/**
 * @param {import('@11ty/eleventy/src/EleventyConfig')} eleventyConfig Test
 */
module.exports = function (eleventyConfig) {
  // Optimize all of the images automatically into webp
  optimizeImages();
  // Optimize all of the css automatically
  optimizeCSS();

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginBetterSlug);
  eleventyConfig.addPlugin(excerpt);
  
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/js/");

  eleventyConfig.addFilter("JsonStringify", function(value) {
    return util.inspect(value);
  });

  eleventyConfig.addFilter("dateFormat", function(date) {
    var monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];

    return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  });

  // Automatically minify output html files
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if(outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      });
      return minified;
    }

    return content;
  });

  return {
    dir: {
      input: 'src',
      output: 'docs'
    },
    templateFormats: [
      "njk",
      "html",
      "md",
    ]
  }
}