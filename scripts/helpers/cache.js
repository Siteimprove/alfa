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
class Cache {
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
    const digest = getDigest(Cache.version + "\u{0000}" + key);

    return path.join(this.root, digest.substring(0, 2), `${digest}.json`);
  }

  /**
   * @return {Iterable<string>}
   */
  keys() {
    if (!isDirectory(this.root)) {
      return [];
    }

    return [...readDirectory(this.root)]
      .map(file => path.join(this.root, file))
      .filter(isFile)
      .map(file => JSON.parse(readFile(file)).key);
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

    /** @type {Entry<T>} */
    const { value } = JSON.parse(readFile(file));

    return value;
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
}

exports.Cache = Cache;
