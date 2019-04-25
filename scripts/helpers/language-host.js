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
     * @type {string}
     */
    this.version = this.computeVersion();

    /**
     * @private
     * @type {TypeScript.CompilerOptions}
     */
    this.options = getCompilerOptions(configFile);

    /**
     * @private
     * @type {Array<TypeScript.ProjectReference>}
     */
    this.references = getProjectReferences(configFile);

    /**
     * @private
     * @type {string}
     */
    this.currentDirectory = process.cwd();
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
    return this.version;
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
    return this.references;
  }

  /**
   * @return {string}
   */
  getCurrentDirectory() {
    return this.currentDirectory;
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
    return path.resolve(this.currentDirectory, file);
  }

  /**
   * @private
   * @param {string} file
   * @return {ScriptInfo}
   */
  getFile(file) {
    file = this.resolvePath(file);

    if (!this.files.has(file)) {
      this.addFile(file);
    }

    return /** @type {ScriptInfo} */ (this.files.get(file));
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  addFile(file) {
    file = this.resolvePath(file);

    const text = this.readFile(file);
    const version = this.createHash(text);

    const current = this.files.get(file);

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
      case ".ts":
        kind = TypeScript.ScriptKind.TS;
        break;
      case ".tsx":
        kind = TypeScript.ScriptKind.TSX;
    }

    this.files.set(file, { version, kind, snapshot });

    this.version = this.computeVersion();

    return true;
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  deleteFile(file) {
    file = this.resolvePath(file);

    if (this.files.delete(file)) {
      this.version = this.computeVersion();
      return true;
    }

    return false;
  }

  /**
   * @private
   * @return {string}
   */
  computeVersion() {
    const files = [...this.files.values()];

    const versions = files.map(file => file.version);

    return getDigest(versions.sort().join("\0"));
  }
}

exports.LanguageHost = LanguageHost;

/**
 * @param {string} configFile
 * @return {TypeScript.ParsedCommandLine}
 */
function getParsedConfiguration(configFile) {
  const { config } = TypeScript.parseConfigFileTextToJson(
    configFile,
    readFile(configFile)
  );

  return TypeScript.parseJsonConfigFileContent(
    config,
    TypeScript.sys,
    path.dirname(configFile)
  );
}

/**
 * @param {string} configFile
 * @return {TypeScript.CompilerOptions}
 */
function getCompilerOptions(configFile) {
  return getParsedConfiguration(configFile).options;
}

/**
 * @param {string} configFile
 * @return {Array<TypeScript.ProjectReference>}
 */
function getProjectReferences(configFile) {
  return [...(getParsedConfiguration(configFile).projectReferences || [])];
}
