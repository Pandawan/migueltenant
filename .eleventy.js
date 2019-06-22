const optimizeImages = require('./tools/optimize-images');

module.exports = function (eleventyConfig) {
  
  // Optimize all of the images automatically
  optimizeImages();

  return {
    dir: {
      input: 'src',
      output: 'docs'
    },
    templateFormats: [
      "html",
      "md",
      "css",
      "png"
    ]
  }
}