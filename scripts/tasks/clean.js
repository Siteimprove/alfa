const chalk = require("chalk");

const { findFiles, removeFile } = require("../helpers/file-system");
const { endsWith } = require("../helpers/predicates");
const notify = require("../helpers/notify");

/**
 * @param {string} directory
 * @return {void}
 */
function clean(directory) {
  const files = findFiles(
    [`${directory}/src`, `${directory}/test`],
    endsWith(".js", ".d.ts", ".map"),
    {
      gitIgnore: false
    }
  );

  notify.pending(`${chalk.gray(directory)} Cleaning directory`);

  for (const file of files) {
    removeFile(file);
  }
}

exports.clean = clean;
