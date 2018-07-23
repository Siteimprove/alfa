import * as path from "path";
import * as fs from "fs";
import * as TypeScript from "typescript";
import * as TSLint from "tslint";
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
   * @return {Array<TypeScript.Diagnostic>}
   */
  diagnose(file) {
    return this.projectFor(file).diagnose(file);
  }

  /**
   * @param {string} file
   * @return {Array<TypeScript.OutputFile>}
   */
  compile(file) {
    return this.projectFor(file).compile(file);
  }

  /**
   * @param {string} file
   * @return {Array<TSLint.RuleFailure>}
   */
  lint(file) {
    return this.projectFor(file).lint(file);
  }

  /**
   * @param {string} file
   * @param {function(TypeScript.Node): void} visitor
   */
  walk(file, visitor) {
    this.projectFor(file).walk(file, visitor);
  }
}

/**
 * Shared workspace used between different tasks.
 *
 * @type {Workspace}
 */
export const workspace = new Workspace();

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
