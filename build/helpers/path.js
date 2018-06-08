// @ts-check

const path = require("path");

/**
 * @param {Array<string>} extensions
 * @return {Function}
 */
function withExtension(...extensions) {
  return file => extensions.indexOf(path.extname(file)) !== -1;
}

module.exports = { withExtension };
