const path = require("path");

const { isFile, readFile, writeFile } = require("./file-system");
const { getDigest } = require("./crypto");

const cacheRoot = process.env.CACHE_DIR || ".cache";

/**
 * @template T
 * @typedef {object} Entry
 * @property {string} revision
 * @property {T} value
 */

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
   */
  pathTo(key) {
    return path.join(this.root, getDigest(key) + ".json");
  }

  /**
   * @param {string} key
   * @param {string} revision
   * @return {boolean}
   */
  has(key, revision) {
    const file = this.pathTo(key);

    if (!isFile(file)) {
      return false;
    }

    /** @type {Entry<T>} */
    const entry = JSON.parse(readFile(file));

    return entry.revision === revision;
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

    /** @type {Entry<T>} */
    const entry = JSON.parse(readFile(file));

    if (entry.revision !== revision) {
      return null;
    }

    return entry.value;
  }

  /**
   * @param {string} key
   * @param {string} revision
   * @param {T} value
   */
  set(key, revision, value) {
    const file = this.pathTo(key);

    writeFile(file, JSON.stringify({ revision, value }));
  }
}

exports.Cache = Cache;
