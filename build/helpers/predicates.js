// @ts-check

/**
 * @param {Array<string>} endings
 * @return {function(string): boolean}
 */
function endsWith(...endings) {
  return string => endings.some(ending => string.endsWith(ending));
}

module.exports = { endsWith };
