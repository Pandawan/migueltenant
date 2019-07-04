const util = require('util');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBetterSlug = require("@borisschapira/eleventy-plugin-better-slug");
const excerpt = require('eleventy-plugin-excerpt');

const optimizeImages = require('./tools/optimize-images');

module.exports = function (eleventyConfig) {
  // Optimize all of the images automatically into webp
  optimizeImages();

  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginBetterSlug);
  eleventyConfig.addPlugin(excerpt);
  
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/js/");

  eleventyConfig.addFilter("JsonStringify", function(value) {
    return util.inspect(value);
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
      "css",
      "png",
    ]
  }
}