/// <reference path="../types/gaze.d.ts" />

const path = require("path");
const fs = require("fs");
const gaze = require("gaze");
const git = require("./git");

/**
 * @param {string} path
 * @return {boolean}
 */
function isFile(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (err) {
    return false;
  }
}

exports.isFile = isFile;

/**
 * @param {string} file
 * @return {string}
 */
function readFile(file) {
  return fs.readFileSync(file, "utf8");
}

exports.readFile = readFile;

/**
 * @param {string} file
 * @param {any} data
 * @return {void}
 */
function writeFile(file, data) {
  makeDirectory(path.dirname(file));

  if (typeof data !== "string") {
    data = JSON.stringify(data, null, 2) + "\n";
  }

  fs.writeFileSync(file, data);
}

exports.writeFile = writeFile;

/**
 * @param {string} file
 * @return {void}
 */
function removeFile(file) {
  return fs.unlinkSync(file);
}

exports.removeFile = removeFile;

/**
 * @param {string | Array<string>} directories
 * @param {function(string): boolean} predicate
 * @param {{ gitIgnore?: boolean }} [options]
 * @param {Set<string>} [visited]
 * @return {Array<string>}
 */
function findFiles(directories, predicate, options = {}, visited = new Set()) {
  /** @type {Array<string>} */
  const files = [];

  if (typeof directories === "string") {
    directories = [directories];
  }

  for (const directory of directories) {
    if (visited.has(directory)) {
      continue;
    }

    visited.add(directory);

    if (!fs.existsSync(directory)) {
      return files;
    }

    for (let file of readDirectory(directory)) {
      file = path.join(directory, file);

      if (options.gitIgnore !== false && git.isIgnored(file)) {
        continue;
      }

      if (isDirectory(file)) {
        files.push(...findFiles(file, predicate, options, visited));
      } else if (predicate(file)) {
        files.push(file);
      }
    }
  }

  return files;
}

exports.findFiles = findFiles;

/**
 * @param {string | Array<string>} pattern
 * @param {function("changed" | "added", string)} listener
 * @param {{ gitIgnore?: boolean }} [options]
 * @return {void}
 */
function watchFiles(pattern, listener, options = {}) {
  /**
   * @param {"changed" | "added"} event
   * @param {string} file
   */
  const handler = (event, file) => {
    if (file === undefined) {
      return;
    }

    file = path.relative(process.cwd(), file);

    if (options.gitIgnore !== false && git.isIgnored(file)) {
      return;
    }

    if (isFile(file)) {
      listener(event, file);
    }
  };

  gaze(pattern, (err, watcher) => {
    if (err !== null) {
      throw err;
    }

    watcher.on("changed", file => {
      handler("changed", file);
    });

    watcher.on("added", file => {
      handler("added", file);
    });
  });
}

exports.watchFiles = watchFiles;

/**
 * @param {string} path
 * @return {boolean}
 */
function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    return false;
  }
}

exports.isDirectory = isDirectory;

/**
 * @param {string} directory
 * @return {object}
 */
function readDirectory(directory) {
  return fs.readdirSync(directory);
}

exports.readDirectory = readDirectory;

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

exports.makeDirectory = makeDirectory;

/**
 * @param {string} directory
 * @return {void}
 */
function removeDirectory(directory) {
  if (!fs.existsSync(directory)) {
    return;
  }

  for (let file of readDirectory(directory)) {
    file = path.join(directory, file);

    if (isDirectory(file)) {
      removeDirectory(file);
    } else {
      removeFile(file);
    }
  }

  fs.rmdirSync(directory);
}

exports.removeDirectory = removeDirectory;
