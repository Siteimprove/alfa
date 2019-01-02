const { readFile, writeFile } = require("./file-system");

const { deleteProperty } = Reflect;

class Manifest {
  /**
   * @param {string} file
   */
  constructor(file) {
    /**
     * @private
     * @type {string}
     */
    this.file = file;

    /**
     * @private
     * @type {object}
     */
    this.manifest = this.read();

    /**
     * @prviate
     * @type {Promise<void> | null}
     */
    this.writer = null;
  }

  /**
   * @return {object}
   */
  read() {
    return JSON.parse(readFile(this.file));
  }

  /**
   * @return {Promise<void>}
   */
  async write() {
    if (this.writer === null) {
      this.writer = new Promise(resolve =>
        setTimeout(() => {
          writeFile(this.file, this.manifest);
          this.writer = null;
          resolve();
        }, 100)
      );
    }

    return this.writer;
  }

  /**
   * @template T
   * @param {string} key
   * @param {T} [value]
   * @return {T | null}
   */
  get(key, value) {
    if (this.manifest[key] !== undefined) {
      return this.manifest[key];
    }

    if (value !== undefined) {
      return value;
    }

    return null;
  }

  /**
   * @template T
   * @param {string} key
   * @param {T} value
   */
  set(key, value) {
    this.manifest[key] = value;
    this.write();
  }

  /**
   * @param {string} key
   */
  delete(key) {
    deleteProperty(this.manifest, key);
    this.write();
  }

  /**
   * @param {{ normal?: boolean, dev?: boolean, peer?: boolean }} [options]
   * @return {Map<string, string>}
   */
  dependencies(options = {}) {
    /** @type {Array<string>} */
    const lookup = [];

    if (options.normal !== false) {
      lookup.push("dependencies");
    }

    if (options.dev) {
      lookup.push("devDependencies");
    }

    if (options.peer) {
      lookup.push("peerDependencies");
    }

    /** @type {Map<string, string>} */
    const dependencies = new Map();

    for (const key of lookup) {
      const target = this.get(key, /** @type {object} */ ({}));

      for (const dependency in target) {
        dependencies.set(dependency, target[dependency]);
      }
    }

    return dependencies;
  }
}

exports.Manifest = Manifest;
