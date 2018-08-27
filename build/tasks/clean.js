const { findFiles, removeFile } = require("../helpers/file-system");
const { endsWith } = require("../helpers/predicates");

/**
 * @param {string} directory
 */
function clean(directory) {
  const shouldClean = endsWith(".js", ".d.ts", ".map");

  const files = findFiles(
    [`${directory}/src`, `${directory}/test`],
    shouldClean,
    {
      gitIgnore: false
    }
  );

  for (const file of files) {
    removeFile(file);
  }
}

exports.clean = clean;
