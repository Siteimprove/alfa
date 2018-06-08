// @ts-check

const path = require("path");
const fs = require("fs");

/**
 * @param {string} file
 * @return {string}
 */
function readFile(file) {
  return fs.readFileSync(file, "utf8");
}

/**
 * @param {string} file
 * @param {string} data
 * @return {void}
 */
function writeFile(file, data) {
  makeDirectory(path.dirname(file));
  fs.writeFileSync(file, data);
}

/**
 * @param {string} file
 * @return {void}
 */
function removeFile(file) {
  return fs.unlinkSync(file);
}

/**
 * @param {string} directory
 * @return {object}
 */
function readDirectory(directory) {
  return fs.readdirSync(directory);
}

/**
 * @param {string} directory
 * @return {void}
 */
function makeDirectory(directory) {
  directory = path.resolve(directory);

  try {
    fs.mkdirSync(directory);
  } catch (err) {
    if (err.code === "ENOENT") {
      makeDirectory(path.dirname(directory));
      makeDirectory(directory);
    } else {
      if (!fs.statSync(directory).isDirectory()) {
        throw new Error("Path is not a directory");
      }
    }
  }
}

/**
 * @param {string} directory
 * @return {void}
 */
function removeDirectory(directory) {
  fs.rmdirSync(directory);
}

module.exports = {
  readFile,
  writeFile,
  removeFile,
  readDirectory,
  makeDirectory,
  removeDirectory
};
