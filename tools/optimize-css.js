const path = require("path");
const glob = require("glob");
const fse = require('fs-extra');
const CleanCSS = require('clean-css');

/**
 * Optimize the given images into webp
 * @param {string=} input A glob of the images to convert from.
 * @param {string=} output The directory to output the images to.
 */
module.exports = async function(input, output) {
  try {
    const inputPath = input
      ? path.normalize(input)
      : path.join(__dirname, "../src/css/*.css");
    const outputPath = output
      ? path.normalize(output)
      : path.join(__dirname, "../docs/css");
    console.log(`Optimizing css from ${inputPath} to ${outputPath}.`);

    await fse.ensureDir(outputPath);

    // Get all filenames from input glob
    const fileNames = await new Promise((resolve, reject) => {
      glob(inputPath, (err, fileNames) => {
        if (err) reject(err);
        else resolve(fileNames.map(fileName => path.normalize(fileName)));
      });
    });

    const cleanCSS = new CleanCSS({
      returnPromise: true
    });

    const operations = [];
    
    // Loop through every file and minify them
    for (const filePath of fileNames) {
      const outputFilePath = path.join(outputPath, path.basename(filePath));

      const operation = async () => {
        const fileInput = await fse.readFile(filePath, { encoding: 'utf8' });
        const output = await cleanCSS.minify(fileInput);
        await fse.writeFile(outputFilePath, output.styles);
      };

      operations.push(operation());
    }
    
    // Wait for all operations to finish
    await Promise.all(operations);

    console.log("Successfully optimized css.");
  } catch (error) {
    console.error(`Error while optimizing css: ${error}`);
  }
};

