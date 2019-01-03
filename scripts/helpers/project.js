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
 * @property {string} text
 * @property {TypeScript.IScriptSnapshot} snapshot
 * @property {TypeScript.ScriptKind} kind
 */

/**
 * @typedef {object} ScriptOutput
 * @property {string} version
 * @property {Array<TypeScript.OutputFile>} files
 */

class Project {
  /**
   * @param {string} configFile
   * @param {TypeScript.DocumentRegistry} [registry]
   */
  constructor(configFile, registry) {
    /**
     * @private
     * @type {LanguageHost}
     */
    this.host = new LanguageHost(configFile);

    /**
     * @private
     * @type {TypeScript.LanguageService}
     */
    this.service = TypeScript.createLanguageService(this.host, registry);

    /**
     * @private
     * @type {TypeScript.ModuleResolutionCache}
     */
    this.modules = TypeScript.createModuleResolutionCache(
      this.host.getCurrentDirectory(),
      file => {
        return this.resolvePath(file);
      }
    );

    /**
     * @private
     * @type {Cache<ScriptOutput>}
     */
    this.output = new Cache("compile");

    /**
     * @private
     * @type {TSLint.Configuration.IConfigurationFile | undefined}
     */
    this.tslint = TSLint.Configuration.findConfiguration(
      "tslint.json",
      configFile
    ).results;
  }

  /**
   * @param {string} file
   * @return {TypeScript.SourceFile | null}
   */
  getSource(file) {
    file = this.resolvePath(file);

    this.host.addFile(file);

    const program = this.service.getProgram();

    if (program === undefined) {
      return null;
    }

    const source = program.getSourceFile(file);

    if (source === undefined) {
      return null;
    }

    return source;
  }

  /**
   * @param {string} file
   * @return {string}
   */
  resolvePath(file) {
    return path.resolve(this.host.getCurrentDirectory(), file);
  }

  /**
   * @param {string} file
   * @return {Iterable<string>}
   */
  resolveImports(file) {
    file = this.resolvePath(file);

    /** @type {Array<string>} */
    const imports = [];

    const { text } = this.host.addFile(file);
    const { importedFiles } = TypeScript.preProcessFile(text);

    for (const { fileName: importedFile } of importedFiles) {
      const { resolvedModule } = TypeScript.resolveModuleName(
        importedFile,
        file,
        this.host.getCompilationSettings(),
        this.host,
        this.modules
      );

      if (resolvedModule === undefined) {
        continue;
      }

      const resolvedFile = resolvedModule.resolvedFileName;

      if (resolvedFile.includes("node_modules")) {
        continue;
      }

      imports.push(resolvedFile);
    }

    return imports;
  }

  /**
   * @param {string} file
   * @return {Array<TypeScript.Diagnostic>}
   */
  diagnose(file) {
    file = this.resolvePath(file);

    this.host.addFile(file);

    const diagnostics = [
      ...this.service.getSyntacticDiagnostics(file),
      ...this.service.getSemanticDiagnostics(file)
    ];

    diagnostics.sort((a, b) => {
      return (a.start || 0) - (b.start || 0);
    });

    return diagnostics;
  }

  /**
   * @param {string} file
   * @return {Array<TypeScript.OutputFile>}
   */
  compile(file) {
    file = this.resolvePath(file);

    const { version } = this.host.addFile(file);

    let output = this.output.get(file);

    if (output === null || output.version !== version) {
      output = {
        version,
        files: this.service.getEmitOutput(file).outputFiles
      };

      this.output.set(file, output);
    }

    return output.files;
  }

  /**
   * @param {string} file
   * @return {Array<TSLint.RuleFailure>}
   */
  lint(file) {
    file = this.resolvePath(file);

    const { text } = this.host.addFile(file);

    const linter = new TSLint.Linter({ fix: false }, this.service.getProgram());

    linter.lint(file, text, this.tslint);

    const { failures } = linter.getResult();

    failures.sort((a, b) => {
      return (
        a.getStartPosition().getPosition() - b.getStartPosition().getPosition()
      );
    });

    return failures;
  }

  /**
   * @template T
   * @param {string} file
   * @param {function(TypeScript.Node): T | void} visitor
   * @return {T | void}
   */
  walk(file, visitor) {
    const source = this.getSource(file);

    if (source !== null) {
      return visit(source);
    }

    /**
     * @param {TypeScript.Node} node
     * @return {T | void}
     */
    function visit(node) {
      const result = visitor(node);

      if (result !== undefined) {
        return result;
      }

      return TypeScript.forEachChild(node, visit);
    }
  }
}

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
    this.version = "";

    /**
     * @private
     * @type {object}
     */
    this.options = this.getOptions(configFile);

    /**
     * @type {string}
     */
    this.cwd = process.cwd();
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

    const snapshot = TypeScript.ScriptSnapshot.fromString(text);

    this.version = getDigest(this.version + version);

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
    this.files.delete(file);
  }
}

exports.Project = Project;
