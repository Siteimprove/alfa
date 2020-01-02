const TypeScript = require("typescript");

const { LanguageHost } = require("./language-host");

exports.Project = class Project {
  /**
   * @param {string} configFile
   * @param {TypeScript.DocumentRegistry} [registry]
   */
  constructor(configFile, registry) {
    /**
     * @private
     */
    this._host = new LanguageHost(configFile);

    /**
     * @private
     */
    this._service = TypeScript.createLanguageService(this._host, registry);

    /**
     * @private
     */
    this._factory = TypeScript.createAbstractBuilder;

    /**
     * @private
     * @type {TypeScript.BuilderProgram}
     */
    this._program = this.getProgram();
  }

  /**
   * @private
   * @return {TypeScript.BuilderProgram}
   */
  getProgram() {
    this._program = this._factory(
      /** @type {TypeScript.Program} */ (this._service.getProgram()),
      this._host,
      this._program
    );

    return this._program;
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  addFile(file) {
    return this._host.addFile(file);
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  deleteFile(file) {
    return this._host.deleteFile(file);
  }

  /**
   * @param {string} file
   * @return {Iterable<string>}
   */
  getDependencies(file) {
    const program = this.getProgram();

    const source = program.getSourceFile(file);

    if (source === undefined) {
      return [];
    }

    return (
      program
        .getAllDependencies(source)
        // The first dependency is always the file itself
        .slice(1)
    );
  }

  /**
   * @param {string} file
   * @return {Iterable<TypeScript.Diagnostic>}
   */
  getDiagnostics(file) {
    const program = this.getProgram();

    /** @type {Array<TypeScript.Diagnostic>} */
    const diagnostics = [];

    const source = program.getSourceFile(file);

    if (source !== undefined) {
      diagnostics.push(
        ...program.getSemanticDiagnostics(source),
        ...program.getSyntacticDiagnostics(source),
        ...program.getDeclarationDiagnostics(source)
      );

      diagnostics.sort((a, b) => {
        return (a.start || 0) - (b.start || 0);
      });
    }

    return diagnostics;
  }

  /**
   * @param {string} file
   * @return {Iterable<TypeScript.OutputFile>}
   */
  getOutputFiles(file) {
    const program = this.getProgram();

    /** @type {Array<TypeScript.OutputFile>} */
    const files = [];

    const source = program.getSourceFile(file);

    if (source !== undefined) {
      program.emit(source, (name, text, writeByteOrderMark) => {
        files.push({ name, text, writeByteOrderMark });
      });
    }

    return files;
  }
};
