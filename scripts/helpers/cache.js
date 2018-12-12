const path = require("path");

const { isFile, readFile, writeFile } = require("./file-system");
const { getDigest } = require("./crypto");

const cacheRoot = process.env.CACHE_DIR || ".cache";

/**
 * @template T
 */
class Cache {
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
    return path.join(this.root, getDigest(key) + ".json");
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
   * @param {string} revision
   * @return {T | null}
   */
  get(key, revision) {
    const file = this.pathTo(key);

    if (!isFile(file)) {
      return null;
    }

    /** @type {T} */
    const value = JSON.parse(readFile(file));

    return value;
  }

  /**
   * @param {string} key
   * @param {T} value
   */
  set(key, value) {
    const file = this.pathTo(key);

    writeFile(file, JSON.stringify(value));
  }
}

exports.Cache = Cache;
