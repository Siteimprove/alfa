const path = require("path");

/**
 * @param {string} file
 * @param {string} extension
 * @return {string}
 */
function withExtension(file, extension) {
  return path.join(
    path.dirname(file),
    path.basename(file, path.extname(file)) + extension
  );
}

exports.withExtension = withExtension;
