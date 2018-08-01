import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";
import * as TypeScript from "typescript";
import * as TSLint from "tslint";

/**
 * @typedef {Object} ScriptInfo
 * @property {string} version
 * @property {string} text
 * @property {TypeScript.IScriptSnapshot} snapshot
 * @property {TypeScript.ScriptKind} kind
 */

export class Project {
  /**
   * @param {string} configFile
   * @param {TypeScript.DocumentRegistry} registry
   */
  constructor(configFile, registry) {
    /**
     * @private
     * @type {InMemoryLanguageServiceHost}
     */
    this.host = new InMemoryLanguageServiceHost(configFile);

    /**
     * @private
     * @type {TypeScript.LanguageService}
     */
    this.service = TypeScript.createLanguageService(this.host, registry);

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
   * @private
   * @param {string} file
   * @return {string}
   */
  resolve(file) {
    return path.resolve(process.cwd(), file);
  }

  /**
   * @param {string} file
   * @return {Array<TypeScript.Diagnostic>}
   */
  diagnose(file) {
    file = this.resolve(file);

    const { service } = this;

    this.host.addFile(file);

    const diagnostics = [
      ...service.getSyntacticDiagnostics(file),
      ...service.getSemanticDiagnostics(file)
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
    file = this.resolve(file);

    this.host.addFile(file);

    return this.service.getEmitOutput(file).outputFiles;
  }

  /**
   * @param {string} file
   * @return {Array<TSLint.RuleFailure>}
   */
  lint(file) {
    file = this.resolve(file);

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
   * @param {string} file
   * @param {function(TypeScript.Node): void} visitor
   */
  walk(file, visitor) {
    const program = this.service.getProgram();

    if (program === undefined) {
      return;
    }

    const source = program.getSourceFile(file);

    if (source !== undefined) {
      visit(source);
    }

    /**
     * @param {TypeScript.Node} node
     */
    function visit(node) {
      visitor(node);
      TypeScript.forEachChild(node, visit);
    }
  }
}

class InMemoryLanguageServiceHost {
  /**
   * @param {string} configFile
   */
  constructor(configFile) {
    /** @type {Map<string, ScriptInfo>} */
    this.files = new Map();

    /** @type {string} */
    this.version = "";

    /** @type {object} */
    this.options = this.getOptions(configFile);
  }

  /**
   * @private
   * @param {string} configFile
   * @return {TypeScript.CompilerOptions}
   */
  getOptions(configFile) {
    const { config } = TypeScript.parseConfigFileTextToJson(
      configFile,
      fs.readFileSync(configFile, "utf8")
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
    return process.cwd();
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
  useCaseSensitivefiles() {
    return false;
  }

  /**
   * @param {string} file
   * @param {string} [encoding]
   * @return {string}
   */
  readFile(file, encoding = "utf8") {
    return fs.readFileSync(file, encoding);
  }

  /**
   * @param {string} file
   * @return {string}
   */
  realpath(file) {
    return fs.realpathSync(file);
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  fileExists(file) {
    return fs.existsSync(file);
  }

  /**
   * @param {string} directory
   * @return {Array<string>}
   */
  getDirectories(directory) {
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs
      .readdirSync(directory)
      .filter(entry => fs.statSync(path.join(directory, entry)).isDirectory());
  }

  /**
   * @param {string} file
   * @return {ScriptInfo}
   */
  addFile(file) {
    const text = fs.readFileSync(file, "utf8");
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

/**
 * @param {string} file
 * @return {string}
 */
function getDigest(file) {
  return crypto
    .createHash("md5")
    .update(file)
    .digest("hex");
}
