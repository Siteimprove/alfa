const path = require("path");

const {
  isFile,
  isDirectory,
  readFile,
  readDirectory,
  writeFile,
  removeFile
} = require("./file-system");
const { getDigest } = require("./crypto");

const cacheRoot = process.env.CACHE_DIR || ".cache";

/**
 * @template T
 * @typedef {object} Entry
 * @property {string} key
 * @property {T} value
 */

/**
 * @template T
 */
exports.Cache = class Cache {
  /**
   * @type {number}
   */
  static get version() {
    return 1;
  }

  /**
   * @param {string} name
   */
  constructor(name) {
    /**
     * @private
     * @type {string}
     */
    this.root = path.join(cacheRoot, name);
  }

  /**
   * @private
   * @param {string} key
   * @return {string}
   */
  pathTo(key) {
    const digest = getDigest(`${Cache.version}\u{0000}${key}`);

    return path.join(this.root, digest.substring(0, 2), `${digest}.json`);
  }

  /**
   * @return {Iterable<string>}
   */
  *keys() {
    if (isDirectory(this.root)) {
      for (const file of readDirectory(this.root)) {
        if (isFile(file)) {
          const data = readFile(file);

          if (data !== null) {
            yield JSON.parse(data).key;
          }
        }
      }
    }
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  has(key) {
    return isFile(this.pathTo(key));
  }

  /**
   * @param {string} key
   * @return {T | undefined}
   */
  get(key) {
    const file = this.pathTo(key);

    if (!isFile(file)) {
      return undefined;
    }

    return JSON.parse(readFile(file)).value;
  }

  /**
   * @param {string} key
   * @param {T} value
   */
  set(key, value) {
    const file = this.pathTo(key);

    writeFile(file, JSON.stringify({ key, value }));
  }

  /**
   * @param {string} key
   * @return {boolean}
   */
  delete(key) {
    const file = this.pathTo(key);

    if (!isFile(file)) {
      return false;
    }

    removeFile(file);

    return true;
  }
};
