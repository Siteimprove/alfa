const { findFiles, removeFile } = require("../helpers/file-system");
const { endsWith, not } = require("../helpers/predicates");

/**
 * @param {string} directory
 */
function clean(directory) {
  const files = findFiles(
    [`${directory}/src`, `${directory}/test`],
    endsWith(".js", ".d.ts", ".map")
      .not(
        /** @param {string} files */ file =>
          file !== "alfa-unicode/src/characters.js"
      )
      .not(
        /** @param {string} files */ file =>
          file !== "alfa-unicode/src/characters.d.ts"
      )
      .not(
        /** @param {string} files */ file =>
          file !== "alfa-unicode/src/characters.js.map"
      ),
    {
      gitIgnore: false
    }
  );

  for (const file of files) {
    removeFile(file);
  }
}

exports.clean = clean;
