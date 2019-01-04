const { writeFile } = require("../helpers/file-system");
const { workspace } = require("../helpers/workspace");
const { Project } = require("../helpers/project");

/**
 * @param {string} file
 * @param {Project} [project]
 * @return {boolean}
 */
function build(file, project = workspace.projectFor(file)) {
  const files = project.getOutputFiles(file);

  for (const { name, text } of files) {
    writeFile(name, text);
  }

  return true;
}

exports.build = build;
