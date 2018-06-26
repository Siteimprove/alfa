import * as path from "path";
import * as fs from "fs";
import * as git from "./git";

/**
 * @param {string} path
 * @return {boolean}
 */
export function isFile(path) {
  try {
    return fs.statSync(path).isFile();
  } catch (err) {
    return false;
  }
}

/**
 * @param {string} file
 * @return {string}
 */
export function readFile(file) {
  return fs.readFileSync(file, "utf8");
}

/**
 * @param {string} file
 * @param {any} data
 * @return {void}
 */
export function writeFile(file, data) {
  makeDirectory(path.dirname(file));

  if (typeof data !== "string") {
    data = JSON.stringify(data, null, 2) + "\n";
  }

  fs.writeFileSync(file, data);
}

/**
 * @param {string} file
 * @return {void}
 */
export function removeFile(file) {
  return fs.unlinkSync(file);
}

/**
 * @param {string} directory
 * @param {function(string): boolean} predicate
 * @return {Array<string>}
 */
export function findFiles(directory, predicate) {
  /** @type {Array<string>} */
  const files = [];

  if (!fs.existsSync(directory)) {
    return files;
  }

  for (let file of readDirectory(directory)) {
    file = path.join(directory, file);

    if (git.isIgnored(file)) {
      continue;
    }

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
 * @return {fs.FSWatcher}
 */
export function watchFiles(directory, listener) {
  return fs.watch(directory, { recursive: true }, (event, file) => {
    if (file === undefined) {
      return;
    }

    file = path.join(directory, file);

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
export function isDirectory(path) {
  try {
    return fs.statSync(path).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * @param {string} directory
 * @return {object}
 */
export function readDirectory(directory) {
  return fs.readdirSync(directory);
}

/**
 * @param {string} directory
 * @return {void}
 */
export function makeDirectory(directory) {
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
export function removeDirectory(directory) {
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
