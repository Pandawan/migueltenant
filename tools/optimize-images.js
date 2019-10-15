const path = require('path');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

module.exports = async function (input, output) {
  try {
    const inputPath = input || path.join(__dirname, '../src/images/*.{jpg,png}');
    const outputPath = output || path.join(__dirname, '../docs/images');
    console.log(`Optimizing images from ${inputPath} to ${outputPath}.`);

    await imagemin([inputPath], {
      destination: outputPath,
      use: [
        imageminWebp({ quality: 100 })
      ]
    });

    console.log('Successfully optimized images.');
  } catch (error) {
    console.error(`Error while optimizing images: ${error}`);
  }
};
