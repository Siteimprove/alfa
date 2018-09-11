const { findFiles, removeFile } = require("../helpers/file-system");
const { endsWith } = require("../helpers/predicates");

/**
 * @param {string} directory
 */
function clean(directory) {
  const files = findFiles(
    [`${directory}/src`, `${directory}/test`],
    endsWith(".js", ".d.ts", ".map"),
    {
      gitIgnore: false
    }
  );

  for (const file of files) {
    removeFile(file);
  }
}

exports.clean = clean;
