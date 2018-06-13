// @ts-check

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const TypeScript = require("typescript");

class Project {
  constructor(configFile, registry) {
    this.host = new InMemoryLanguageServiceHost(configFile);
    this.service = TypeScript.createLanguageService(this.host, registry);
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
   * @return {Array}
   */
  diagnose(file) {
    file = this.resolve(file);

    const { service } = this;

    this.host.addFile(file);

    return [
      ...service.getSyntacticDiagnostics(file),
      ...service.getSemanticDiagnostics(file)
    ];
  }

  /**
   * @param {string} file
   * @return {object}
   */
  compile(file) {
    file = this.resolve(file);

    const { service } = this;

    this.host.addFile(file);

    return service.getEmitOutput(file).outputFiles;
  }
}

class InMemoryLanguageServiceHost {
  constructor(configFile) {
    this.files = new Map();
    this.version = "";
    this.options = this.getOptions(configFile);
  }

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

  getCompilationSettings() {
    return this.options;
  }

  getNewLine() {
    return "\n";
  }

  getProjectVersion() {
    return this.version;
  }

  getScriptFileNames() {
    return [...this.files.keys()];
  }

  getScriptKind(file) {
    const { kind } = this.files.get(file) || this.addFile(file);
    return kind;
  }

  getScriptVersion(file) {
    const { version } = this.files.get(file) || this.addFile(file);
    return version;
  }

  getScriptSnapshot(file) {
    const { snapshot } = this.files.get(file) || this.addFile(file);
    return snapshot;
  }

  getCurrentDirectory() {
    return process.cwd();
  }

  getDefaultLibFileName(options) {
    return TypeScript.getDefaultLibFilePath(options);
  }

  useCaseSensitivefiles() {
    return false;
  }

  readFile(file, encoding = "utf8") {
    return fs.readFileSync(file, encoding);
  }

  realpath(file) {
    return fs.realpathSync(file);
  }

  fileExists(file) {
    return fs.existsSync(file);
  }

  getDirectories(directory) {
    if (!fs.existsSync(directory)) {
      return [];
    }

    return fs
      .readdirSync(directory)
      .filter(entry => fs.statSync(path.join(directory, entry)).isDirectory());
  }

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

    current = { snapshot, version, kind };

    this.files.set(file, current);

    return current;
  }

  removeFile(file) {
    this.files.delete(file);
  }
}

function getDigest(file) {
  return crypto
    .createHash("md5")
    .update(file)
    .digest("hex");
}

module.exports = { Project };
