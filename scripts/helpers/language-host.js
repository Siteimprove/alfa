const path = require("path");
const TypeScript = require("typescript");

const { getDigest } = require("./crypto");
const {
  isDirectory,
  isFile,
  readDirectory,
  readFile,
  realPath,
  writeFile
} = require("./file-system");

/**
 * @typedef {object} ScriptInfo
 * @property {string} version
 * @property {TypeScript.IScriptSnapshot} snapshot
 * @property {TypeScript.ScriptKind} kind
 */

/**
 * @typedef {object} ScriptOutput
 * @property {string} version
 * @property {Array<TypeScript.OutputFile>} files
 */

exports.LanguageHost = class LanguageHost {
  /**
   * @param {string} configFile
   */
  constructor(configFile) {
    const config = getConfiguration(configFile);

    /**
     * @private
     * @type {Map<string, ScriptInfo>}
     */
    this._files = new Map();

    /**
     * @private
     * @type {string}
     */
    this._version = this.computeVersion();

    /**
     * @private
     * @type {TypeScript.CompilerOptions}
     */
    this._options = config.options;

    /**
     * @private
     * @type {Array<TypeScript.ProjectReference>}
     */
    this._references = config.projectReferences
      ? [...config.projectReferences]
      : [];

    /**
     * @private
     * @type {string}
     */
    this._currentDirectory = process.cwd();

    for (const file of config.fileNames) {
      this.addFile(file);
    }
  }

  /**
   * @return {TypeScript.CompilerOptions}
   */
  getCompilationSettings() {
    return this._options;
  }

  /**
   * @return {string}
   */
  getNewLine() {
    return "\n";
  }

  /**
   * @return {string}
   */
  getProjectVersion() {
    return this._version;
  }

  /**
   * @return {Array<string>}
   */
  getScriptFileNames() {
    return [...this._files.keys()];
  }

  /**
   * @param {string} file
   * @return {TypeScript.ScriptKind}
   */
  getScriptKind(file) {
    return this.getFile(file).kind;
  }

  /**
   * @param {string} file
   * @return {string}
   */
  getScriptVersion(file) {
    return this.getFile(file).version;
  }

  /**
   * @param {string} file
   * @return {TypeScript.IScriptSnapshot}
   */
  getScriptSnapshot(file) {
    return this.getFile(file).snapshot;
  }

  /**
   * @return {Array<TypeScript.ProjectReference>}
   */
  getProjectReferences() {
    return this._references;
  }

  /**
   * @return {string}
   */
  getCurrentDirectory() {
    return this._currentDirectory;
  }

  /**
   * @param {TypeScript.CompilerOptions} options
   * @return {string}
   */
  getDefaultLibFileName(options) {
    return TypeScript.getDefaultLibFilePath(options);
  }

  /**
   * @return {boolean}
   */
  useCaseSensitiveFileNames() {
    return false;
  }

  /**
   * @param {string} directory
   * @param {Array<string>} [extensions]
   * @param {Array<string>} [exclude]
   * @param {Array<string>} [include]
   * @param {number} [depth]
   * @return {Array<string>}
   */
  readDirectory(directory, extensions, exclude, include, depth) {
    return [...readDirectory(directory)];
  }

  /**
   * @param {string} file
   * @param {string} [encoding]
   * @return {string}
   */
  readFile(file, encoding = "utf8") {
    return readFile(file, encoding);
  }

  /**
   * @param {string} file
   * @return {string}
   */
  realpath(file) {
    return realPath(file);
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  fileExists(file) {
    return isFile(file);
  }

  /**
   * @param {string} directory
   * @return {boolean}
   */
  directoryExists(directory) {
    return isDirectory(directory);
  }

  /**
   * @param {string} directory
   * @return {Array<string>}
   */
  getDirectories(directory) {
    return [...readDirectory(directory)].filter(found =>
      isDirectory(path.join(directory, found))
    );
  }

  /**
   * @param {string} file
   * @param {string} content
   * @return {void}
   */
  writeFile(file, content) {
    writeFile(file, content);
  }

  /**
   * @param {string} data
   * @return {string}
   */
  createHash(data) {
    return getDigest(data);
  }

  /**
   * @private
   * @param {string} file
   * @return {string}
   */
  resolvePath(file) {
    return path.resolve(this._currentDirectory, file);
  }

  /**
   * @private
   * @param {string} file
   * @return {ScriptInfo}
   */
  getFile(file) {
    file = this.resolvePath(file);

    if (!this._files.has(file)) {
      this.addFile(file);
    }

    return /** @type {ScriptInfo} */ (this._files.get(file));
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  addFile(file) {
    file = this.resolvePath(file);

    const text = this.readFile(file);
    const version = this.createHash(text);

    const current = this._files.get(file);

    if (current !== undefined && current.version === version) {
      return false;
    }

    const snapshot = TypeScript.ScriptSnapshot.fromString(text);

    let kind = TypeScript.ScriptKind.Unknown;

    switch (path.extname(file)) {
      case ".js":
        kind = TypeScript.ScriptKind.JS;
        break;
      case ".jsx":
        kind = TypeScript.ScriptKind.JSX;
        break;
      case ".json":
        kind = TypeScript.ScriptKind.JSON;
        break;
      case ".ts":
        kind = TypeScript.ScriptKind.TS;
        break;
      case ".tsx":
        kind = TypeScript.ScriptKind.TSX;
    }

    this._files.set(file, { version, kind, snapshot });

    this._version = this.computeVersion();

    return true;
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  deleteFile(file) {
    file = this.resolvePath(file);

    if (this._files.delete(file)) {
      this._version = this.computeVersion();
      return true;
    }

    return false;
  }

  /**
   * @private
   * @return {string}
   */
  computeVersion() {
    const files = [...this._files.values()];

    const versions = files.map(file => file.version);

    return getDigest(versions.sort().join("\0"));
  }
};

/**
 * @param {string} configFile
 * @return {TypeScript.ParsedCommandLine}
 */
function getConfiguration(configFile) {
  const { config } = TypeScript.parseConfigFileTextToJson(
    configFile,
    readFile(configFile)
  );

  return TypeScript.parseJsonConfigFileContent(
    config,
    TypeScript.sys,
    path.dirname(configFile),
    {},
    path.basename(configFile)
  );
}
