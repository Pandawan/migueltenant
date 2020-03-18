const path = require("path");
const glob = require("glob");
const sharp = require("sharp");
const fse = require("fs-extra");

const imageSizes = {
  default: {
    large: [960, 540],
    small: [480, 270]
  },
  "profile-pic": {
    large: [256, 256],
    small: [150, 150]
  }
};

/**
 * Gets the appropriate image sizing
 * @param {string} imageName Name of the image
 * @param {'large'|'small'} type The type of the image
 * @returns {[number, number]} The given width, height
 */
function getImageSize(imageName, type) {
  if (imageSizes[imageName] !== undefined) {
    return imageSizes[imageName][type];
  } else {
    return imageSizes.default[type];
  }
}

/**
 * Optimize the given images into webp
 * @param {string=} input A glob of the images to convert from.
 * @param {string=} output The directory to output the images to.
 */
module.exports = async function(input, output) {
  try {
    const inputPath = input
      ? path.normalize(input)
      : path.join(__dirname, "../src/images/*.{jpg,png}");
    const outputPath = output
      ? path.normalize(output)
      : path.join(__dirname, "../docs/images");
    console.log(`Optimizing images from ${inputPath} to ${outputPath}.`);

    await fse.ensureDir(outputPath);

    // Get all filenames from input glob
    const fileNames = await new Promise((resolve, reject) => {
      glob(inputPath, (err, fileNames) => {
        if (err) reject(err);
        else resolve(fileNames.map(fileName => path.normalize(fileName)));
      });
    });

    const operations = [];

    // Loop through every file and convert to webp
    for (const filePath of fileNames) {
      const fileName = path.basename(filePath).replace(/\.[^/.]+$/, "");

      const outputFilePath = path.join(outputPath, fileName);

      // Resize the image to 960x540 (large) (but don't enlarge if already smaller)
      const image = sharp(filePath).resize(...getImageSize(fileName, "large"), {
        fit: "inside",
        withoutEnlargement: true
      });
      operations.push(
        image.png({ quality: 100 }).toFile(outputFilePath + ".png"),
        image.webp({ quality: 100 }).toFile(outputFilePath + ".webp")
      );

      // Resize the image to 480x270 (small) (but don't enlarge if already smaller)
      image.resize(...getImageSize(fileName, "small"), {
        fit: "inside",
        withoutEnlargement: true
      });
      operations.push(
        image.png({ quality: 80 }).toFile(outputFilePath + "-small.png"),
        image.webp({ quality: 80 }).toFile(outputFilePath + "-small.webp")
      );
    }

    // Wait for all webp operations to finish
    await Promise.all(operations);

    console.log("Successfully optimized images.");
  } catch (error) {
    console.error(`Error while optimizing images: ${error}`);
  }
};
