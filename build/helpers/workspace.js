import * as path from "path";
import * as fs from "fs";
import * as TypeScript from "typescript";
import { Project } from "./project";

export class Workspace {
  constructor() {
    this.projects = new Map();
    this.registry = TypeScript.createDocumentRegistry(false, process.cwd());
  }

  /**
   * @param {string} file
   * @return {Project}
   */
  projectFor(file) {
    const configFile = findConfigFile(path.dirname(file));

    if (configFile === null) {
      throw new Error(`${file} has no associated TypeScript configuration`);
    }

    let project = this.projects.get(configFile);

    if (project === undefined) {
      project = new Project(configFile, this.registry);
      this.projects.set(configFile, project);
    }

    return project;
  }

  /**
   * @param {string} file
   * @return {object}
   */
  diagnose(file) {
    return this.projectFor(file).diagnose(file);
  }

  /**
   * @param {string} file
   * @return {object}
   */
  compile(file) {
    return this.projectFor(file).compile(file);
  }
}

/**
 * @param {string} directory
 * @return {string | null}
 */
function findConfigFile(directory) {
  const configFile = path.resolve(directory, "tsconfig.json");

  try {
    if (fs.statSync(configFile).isFile()) {
      return configFile;
    }
  } catch (err) {}

  const parentDirectory = path.dirname(directory);

  if (directory === parentDirectory) {
    return null;
  }

  return findConfigFile(parentDirectory);
}
