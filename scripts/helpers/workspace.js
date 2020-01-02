const TypeScript = require("typescript");

const { Project } = require("./project");
const { isFile } = require("./file-system");

exports.Workspace = class Workspace {
  constructor() {
    /**
     * @private
     * @type {Map<string, Project>}
     */
    this.projects = new Map();

    /**
     * @private
     */
    this.registry = TypeScript.createDocumentRegistry(false, process.cwd());
  }

  /**
   * @param {string} file
   * @return {Project}
   */
  projectFor(file) {
    const configFile = TypeScript.findConfigFile(file, isFile);

    if (configFile === undefined) {
      throw new Error(`${file} has no associated TypeScript configuration`);
    }

    let project = this.projects.get(configFile);

    if (project === undefined) {
      project = new Project(configFile, this.registry);
      this.projects.set(configFile, project);
    }

    return project;
  }
};

/**
 * Shared workspace used between different tasks.
 *
 * @type {exports.Workspace}
 */
exports.workspace = new exports.Workspace();
