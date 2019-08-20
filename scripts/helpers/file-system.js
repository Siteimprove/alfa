const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");
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
 * @param {string} path
 * @return {string}
 */
function realPath(path) {
  return fs.realpathSync(path);
}

exports.realPath = realPath;

/**
 * @param {string} file
 * @param {string} [encoding]
 * @return {string}
 */
function readFile(file, encoding = "utf8") {
  return fs.readFileSync(file, encoding);
}

exports.readFile = readFile;

/**
 * @param {string} file
 * @param {unknown} data
 * @param {string} [encoding]
 * @return {void}
 */
function writeFile(file, data, encoding = "utf8") {
  makeDirectory(path.dirname(file));

  if (typeof data !== "string") {
    data = `${JSON.stringify(data, null, 2)}\n`;
  }

  fs.writeFileSync(file, data, encoding);
}

exports.writeFile = writeFile;

/**
 * @param {string} file
 * @return {void}
 */
function removeFile(file) {
  fs.unlinkSync(file);
}

exports.removeFile = removeFile;

/**
 * @param {string | Iterable<string>} directories
 * @param {(function(string): boolean)} [predicate]
 * @param {{ gitIgnore?: boolean }} [options]
 * @param {Set<string>} [visited]
 * @return {Iterable<string>}
 */
function* findFiles(directories, predicate, options = {}, visited = new Set()) {
  if (typeof directories === "string") {
    directories = [directories];
  }

  for (const directory of directories) {
    if (visited.has(directory)) {
      continue;
    }

    visited.add(directory);

    if (!fs.existsSync(directory)) {
      continue;
    }

    for (let file of readDirectory(directory)) {
      file = path.join(directory, file);

      if (options.gitIgnore !== false) {
        if (git.isIgnored(file)) {
          continue;
        }

        if (isDirectory(file) && file === ".git") {
          continue;
        }
      }

      if (isDirectory(file)) {
        yield* findFiles(file, predicate, options, visited);
      } else if (predicate === undefined || predicate(file)) {
        yield file;
      }
    }
  }
}

exports.findFiles = findFiles;

/**
 * @param {string | Iterable<string>} pattern
 * @param {function("change" | "add", string): void} listener
 * @param {{ gitIgnore?: boolean }} [options]
 * @return {void}
 */
function watchFiles(pattern, listener, options = {}) {
  /**
   * @param {"change" | "add"} event
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

  const watcher = chokidar.watch(
    typeof pattern === "string" ? pattern : [...pattern],
    {
      ignoreInitial: true
    }
  );

  watcher.on("change", file => {
    handler("change", file);
  });

  watcher.on("add", file => {
    handler("add", file);
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
 * @return {Iterable<string>}
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
      if (!isDirectory(directory)) {
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
  if (!isDirectory(directory)) {
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
