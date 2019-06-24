const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const optimizeImages = require('./tools/optimize-images');

module.exports = function (eleventyConfig) {
  // Optimize all of the images automatically into webp
  optimizeImages();

  eleventyConfig.addPlugin(syntaxHighlight);
  
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/js/");

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