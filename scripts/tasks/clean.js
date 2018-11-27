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
    if (
      file === "packages/alfa-unicode/src/characters.js" ||
      file === "packages/alfa-unicode/src/characters.d.ts" ||
      file === "packages/alfa-iana/src/subtags.js" ||
      file === "packages/alfa-iana/src/subtags.d.ts"
    ) {
      continue;
    }

    removeFile(file);
  }
}

exports.clean = clean;
