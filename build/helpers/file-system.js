// @ts-check

const path = require("path");
const fs = require("fs");
const git = require("./git");

/** @type {Array<RegExp>} */
const ignoredFiles = [/node_modules/];

/**
 * @param {string} path
 * @return {boolean}
 */
function isFile(path) {
  try {
    return fs.statSync(path).isFile();
  } catch {
    return false;
  }
}

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
 * @param {function(string): boolean} predicate
 * @return {Array<string>}
 */
function findFiles(directory, predicate) {
  const files = [];

  if (!fs.existsSync(directory)) {
    return files;
  }

  for (let file of readDirectory(directory)) {
    if (ignoredFiles.some(ignore => ignore.test(file))) {
      continue;
    }

    if (git.isIgnored(file)) {
      continue;
    }

    file = path.join(directory, file);

    if (isFile(file) && predicate(file)) {
      files.push(file);
    }

    if (isDirectory(file)) {
      files.push(...findFiles(file, predicate));
    }
  }

  return files;
}

/**
 * @param {string} directory
 * @param {function(string, string)} listener
 * @return {object}
 */
function watchFiles(directory, listener) {
  return fs.watch(directory, { recursive: true }, (event, file) => {
    if (file === undefined) {
      return;
    }

    file = path.join(directory, file);

    if (ignoredFiles.some(ignore => ignore.test(file))) {
      return;
    }

    if (git.isIgnored(file)) {
      return;
    }

    if (isFile(file)) {
      listener(event, file);
    }
  });
}

/**
 * @param {string} path
 * @return {boolean}
 */
function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch {
    return false;
  }
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
  isFile,
  readFile,
  writeFile,
  removeFile,
  findFiles,
  watchFiles,
  isDirectory,
  readDirectory,
  makeDirectory,
  removeDirectory
};
