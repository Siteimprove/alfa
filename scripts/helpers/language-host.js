const path = require("path");
const TypeScript = require("typescript");
const TSLint = require("tslint");

const { getDigest } = require("./crypto");
const {
  isDirectory,
  isFile,
  readDirectory,
  readFile,
  realPath,
  writeFile
} = require("./file-system");
const { Cache } = require("./cache");

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

class LanguageHost {
  /**
   * @param {string} configFile
   */
  constructor(configFile) {
    /**
     * @private
     * @type {Map<string, ScriptInfo>}
     */
    this.files = new Map();

    /**
     * @private
     * @type {number}
     */
    this.version = 0;

    /**
     * @private
     * @type {object}
     */
    this.options = this.getOptions(configFile);

    /**
     * @type {string}
     */
    this.currentDirectory = process.cwd();
  }

  /**
   * @private
   * @param {string} configFile
   * @return {TypeScript.CompilerOptions}
   */
  getOptions(configFile) {
    const { config } = TypeScript.parseConfigFileTextToJson(
      configFile,
      readFile(configFile)
    );

    const { options } = TypeScript.parseJsonConfigFileContent(
      config,
      TypeScript.sys,
      path.dirname(configFile)
    );

    return options;
  }

  /**
   * @return {TypeScript.CompilerOptions}
   */
  getCompilationSettings() {
    return this.options;
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
    return this.version.toString();
  }

  /**
   * @return {Array<string>}
   */
  getScriptFileNames() {
    return [...this.files.keys()];
  }

  /**
   * @param {string} file
   * @return {TypeScript.ScriptKind}
   */
  getScriptKind(file) {
    const { kind } = this.files.get(file) || this.addFile(file);
    return kind;
  }

  /**
   * @param {string} file
   * @return {string}
   */
  getScriptVersion(file) {
    const { version } = this.files.get(file) || this.addFile(file);
    return version;
  }

  /**
   * @param {string} file
   * @return {TypeScript.IScriptSnapshot}
   */
  getScriptSnapshot(file) {
    const { snapshot } = this.files.get(file) || this.addFile(file);
    return snapshot;
  }

  /**
   * @return {string}
   */
  getCurrentDirectory() {
    return this.cwd;
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
   * @param {string} file
   * @param {string} [encoding]
   * @return {string}
   */
  readFile(file, encoding = "utf8") {
    return readFile(file, encoding);
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
   * @return {ScriptInfo}
   */
  addFile(file) {
    const text = readFile(file);
    const version = getDigest(text);

    let current = this.files.get(file);

    if (current !== undefined && current.version === version) {
      return current;
    }

    this.version++;

    const snapshot = TypeScript.ScriptSnapshot.fromString(text);

    let kind = TypeScript.ScriptKind.Unknown;

    switch (path.extname(file)) {
      case ".js":
        kind = TypeScript.ScriptKind.JS;
        break;
      case ".jsx":
        kind = TypeScript.ScriptKind.JSX;
        break;
      case ".ts":
        kind = TypeScript.ScriptKind.TS;
        break;
      case ".tsx":
        kind = TypeScript.ScriptKind.TSX;
    }

    current = { version, text, kind, snapshot };

    this.files.set(file, current);

    return current;
  }

  /**
   * @param {string} file
   */
  removeFile(file) {
    if (this.files.delete(file)) {
      this.version++;
    }
  }
}

exports.LanguageHost = LanguageHost;
