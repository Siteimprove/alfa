const path = require("path");
const TypeScript = require("typescript");
const TSLint = require("tslint");

const { getDigest } = require("./crypto");
const { readFile } = require("./file-system");
const { Cache } = require("./cache");

/**
 * @typedef {object} ScriptOutput
 * @property {string} version
 */

class Project {
  /**
   * @param {string} configFile
   */
  constructor(configFile) {
    /**
     * @private
     * @type {Map<string, ScriptOutput>}
     */
    this.files = new Map();

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
     * @type {TypeScript.CompilerHost}
     */
    this.host = TypeScript.createCompilerHost(this.options);

    /**
     * @private
     * @type {TypeScript.EmitAndSemanticDiagnosticsBuilderProgram}
     */
    this.program = TypeScript.createEmitAndSemanticDiagnosticsBuilderProgram(
      [...this.files.keys()],
      this.options,
      this.host,
      this.program,
      undefined,
      this.references
    );

    /**
     * @private
     * @type {TSLint.Configuration.IConfigurationFile | undefined}
     */
    this.linter = getLinterOptions(configFile);
  }

  /**
   * @return {Iterable<string>}
   */
  *buildProgram() {
    console.time("Program");
    this.program = TypeScript.createEmitAndSemanticDiagnosticsBuilderProgram(
      [...this.files.keys()],
      this.options,
      this.host,
      this.program,
      undefined,
      this.references
    );
    console.timeEnd("Program");

    // while (true) {
    //   const next = this.program.emitNextAffectedFile();

    //   if (next === undefined) {
    //     break;
    //   }

    //   yield next.affected.fileName;
    // }

    /**
     * @return {{ file: string, emitted: boolean } | undefined}
     */
    const getNext = () => {
      let emitted = false;

      const next = this.program.emitNextAffectedFile(file => {
        emitted = true;
      });

      if (next !== undefined && "fileName" in next.affected) {
        const file = path.relative(
          this.host.getCurrentDirectory(),
          next.affected.fileName
        );

        return { file, emitted };
      }

      return undefined;
    };

    let next = getNext();

    while (next !== undefined) {
      const { file, emitted } = next;

      next = getNext();

      if (emitted && !file.startsWith("node_modules")) {
        yield file;
      }
    }
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  addFile(file) {
    file = path.resolve(file);

    const version = getDigest(readFile(file));

    const existing = this.files.get(file);

    if (existing !== undefined && existing.version === version) {
      return false;
    }

    this.files.set(file, { version });

    return true;
  }

  /**
   * @param {string} file
   * @return {boolean}
   */
  deleteFile(file) {
    file = path.resolve(file);

    return this.files.delete(file);
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

    return this.program.getAllDependencies(source);
  }

  /**
   * @param {string} file
   * @return {Iterable<TypeScript.Diagnostic>}
   */
  getDiagnostics(file) {
    /** @type {Array<TypeScript.Diagnostic>} */
    const diagnostics = [];

    const source = this.program.getSourceFile(file);

    if (source !== undefined) {
      diagnostics.push(
        ...this.program.getSemanticDiagnostics(source),
        ...this.program.getSyntacticDiagnostics(source)
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
    /** @type {Array<TypeScript.OutputFile>} */
    const files = [];

    const source = this.program.getSourceFile(file);

    if (source !== undefined) {
      this.program.emit(source, (name, text, writeByteOrderMark) => {
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
    /** @type {Array<TSLint.RuleFailure>} */
    const results = [];

    const source = this.program.getSourceFile(file);

    if (source !== undefined) {
      const { fileName, text } = source;

      const linter = new TSLint.Linter(
        { fix: false },
        this.program.getProgram()
      );

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
