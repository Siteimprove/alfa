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
 * @param {string | Array<string>} directories
 * @param {function(string): boolean} predicate
 * @param {{ gitIgnore?: boolean }} [options]
 * @param {Set<string>} [visited]
 * @return {Array<string>}
 */
export function findFiles(
  directories,
  predicate,
  options = {},
  visited = new Set()
) {
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

/**
 * @param {string} directory
 * @param {function(string, string)} listener
 * @param {{ gitIgnore?: boolean }} [options]
 * @return {fs.FSWatcher}
 */
export function watchFiles(directory, listener, options = {}) {
  return fs.watch(directory, { recursive: true }, (event, file) => {
    if (file === undefined) {
      return;
    }

    file = path.join(directory, file);

    if (options.gitIgnore !== false && git.isIgnored(file)) {
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
