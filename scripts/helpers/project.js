const path = require("path");
const TypeScript = require("typescript");
const TSLint = require("tslint");

const { LanguageHost } = require("./language-host");

class Project {
  /**
   * @param {string} configFile
   * @param {TypeScript.DocumentRegistry} [registry]
   */
  constructor(configFile, registry) {
    /**
     * @private
     */
    this.host = new LanguageHost(configFile);

    /**
     * @private
     */
    this.service = TypeScript.createLanguageService(this.host, registry);

    /**
     * @private
     */
    const factory = (this.factory =
      TypeScript.createEmitAndSemanticDiagnosticsBuilderProgram);

    /**
     * @private
     * @type {ReturnType<typeof factory>}
     */
    this.program = this.factory(
      /** @type {TypeScript.Program} */ (this.service.getProgram()),
      this.host,
      this.program
    );

    /**
     * @private
     */
    this.linter = getLinterOptions(configFile);
  }

  /**
   * @return {Iterable<string>}
   */
  *buildProgram() {
    this.program = this.factory(
      /** @type {TypeScript.Program} */ (this.service.getProgram()),
      this.host,
      this.program
    );

    let next = this.getNextAffectedFile();

    while (next !== undefined) {
      const file = next;

      next = this.getNextAffectedFile();

      if (!file.startsWith("node_modules")) {
        yield file;
      }
    }
  }

  /**
   * @private
   * @return {string | undefined}
   */
  getNextAffectedFile() {
    const next = this.program.emitNextAffectedFile(() => {});

    if (next === undefined) {
      return undefined;
    }

    const file = /** @type {TypeScript.SourceFile} */ (next.affected);

    return path.relative(this.host.getCurrentDirectory(), file.fileName);
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  addFile(file) {
    return this.host.addFile(file);
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  deleteFile(file) {
    return this.host.deleteFile(file);
  }

  /**
   * @param {string} file
   * @return {Iterable<string>}
   */
  getDependencies(file) {
    const source = this.program.getSourceFile(file);

    if (source === undefined) {
      return [];
    }

    return (
      this.program
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
    const program = this.program;

    /** @type {Array<TypeScript.Diagnostic>} */
    const diagnostics = [];

    const source = program.getSourceFile(file);

    if (source !== undefined) {
      diagnostics.push(
        ...program.getSemanticDiagnostics(source),
        ...program.getSyntacticDiagnostics(source)
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
    const program = this.program;

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

  /**
   * @param {string} file
   * @return {Iterable<TSLint.RuleFailure>}
   */
  getLintResults(file) {
    const program = this.program;

    /** @type {Array<TSLint.RuleFailure>} */
    const results = [];

    const source = program.getSourceFile(file);

    if (source !== undefined) {
      const { fileName, text } = source;

      const linter = new TSLint.Linter({ fix: false }, program.getProgram());

      linter.lint(fileName, text, this.linter);

      const { failures } = linter.getResult();

      failures.sort((a, b) => {
        return (
          a.getStartPosition().getPosition() -
          b.getStartPosition().getPosition()
        );
      });

      results.push(...failures);
    }

    return results;
  }

  /**
   * @template T
   * @param {string} file
   * @param {function(TypeScript.Node): T | void} visitor
   * @return {T | void}
   */
  forEachChild(file, visitor) {
    const source = this.program.getSourceFile(file);

    if (source !== undefined) {
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

exports.Project = Project;

/**
 * @param {string} configFile
 * @return {TSLint.Configuration.IConfigurationFile | undefined}
 */
function getLinterOptions(configFile) {
  const { results } = TSLint.Configuration.findConfiguration(
    "tslint.json",
    configFile
  );

  return results;
}
