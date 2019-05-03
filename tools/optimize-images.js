const path = require('path');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

// Top level await trick
(async () => {
  try {
    const inputPath = path.join(__dirname, '../src/images/*.{jpg,png}');
    console.log(`Input: ${inputPath}`);

    const outputPath = path.join(__dirname, '../images');
    console.log(`Output: ${outputPath}`);

    await imagemin([inputPath], outputPath, {
      use: [
        imageminWebp({ quality: 100 })
      ]
    });

    console.log('Done!');
  } catch (error) {
    console.error(error);
  }
})();
