const path = require('path');
const glob = require('glob');
const sharp = require('sharp');

/**
 * Optimize the given images into webp
 * @param {string=} input A glob of the images to convert from.
 * @param {string=} output The directory to output the images to.
 */
module.exports = async function (input, output) {
  try {
    const inputPath = input ? path.normalize(input) : path.join(__dirname, '../src/images/*.{jpg,png}');
    const outputPath = output ? path.normalize(output) : path.join(__dirname, '../docs/images');
    console.log(`Optimizing images from ${inputPath} to ${outputPath}.`);

    // Get all filenames from input glob
    const fileNames = await new Promise((resolve, reject) => {
      glob(inputPath, (err, fileNames) => {
        if (err) reject(err);
        else resolve(fileNames.map(fileName => path.normalize(fileName)));
      });
    });

    const operations = [];

    // Loop through every file and convert to webp
    for (const fileName of fileNames) {
      const outputFilePath = path.join(outputPath, path.basename(fileName).replace(/\.[^/.]+$/, '.webp'));
      operations.push(
        sharp(fileName)
          .webp({ quality: 100 })
          .toFile(outputFilePath)
      );
    }

    // Wait for all webp operations to finish
    await Promise.all(operations);

    console.log('Successfully optimized images.');
  } catch (error) {
    console.error(`Error while optimizing images: ${error}`);
  }
};
