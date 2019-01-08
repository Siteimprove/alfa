const { writeFile } = require("../helpers/file-system");
const { Workspace, workspace } = require("../helpers/workspace");
const { Project } = require("../helpers/project");

/**
 * @param {string} file
 * @param {Project | Workspace} [project]
 * @return {boolean}
 */
function build(file, project = workspace) {
  const compiled = project.compile(file);

  for (const { name, text } of compiled) {
    writeFile(name, text);
  }

  return true;
}

exports.build = build;
