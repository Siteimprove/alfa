// @ts-check

const path = require("path");
const fs = require("fs");
const TypeScript = require("typescript");
const { Project } = require("./project");

class Workspace {
  constructor() {
    this.projects = new Map();
    this.registry = TypeScript.createDocumentRegistry(false, process.cwd());
  }

  projectFor(file) {
    const configurationFile = findConfigurationFile(path.dirname(file))

    if (configurationFile === null) {
      throw new Error(`${file} has no associated TypeScript configuration`);
    }

    const root = path.dirname(configurationFile);

    let project = this.projects.get(root);

    if (project === undefined) {
      project = new Project(root, this.registry);
      this.projects.set(root, project);
    }

    return project;
  }

  diagnose(file) {
    return this.projectFor(file).diagnose(file);
  }

  compile(file) {
    return this.projectFor(file).compile(file);
  }
}

function findConfigurationFile(directory) {
  const configFile = path.resolve(directory, "tsconfig.json");
  const stats = fs.statSync(configFile);

  if (stats.isFile()) {
    return configFile;
  }

  const parentDirectory = path.dirname(directory);

  if (directory === parentDirectory) {
    return null
  }

  return findConfigurationFile(parentDirectory);
}

module.exports = { Workspace };
