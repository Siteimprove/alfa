// @ts-check

/**
 * @param {Array<string>} endings
 * @return {Function}
 */
function endsWith(...endings) {
  return string => endings.some(ending => string.endsWith(ending));
}

module.exports = { endsWith };
