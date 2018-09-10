/**
 * @typedef {function(string): boolean} Predicate
 */

/**
 * @param {Array<string>} endings
 * @return {Predicate}
 */
function endsWith(...endings) {
  return input => endings.some(ending => input.endsWith(ending));
}

exports.endsWith = endsWith;

/**
 * @param {Predicate} predicate
 * @return {Predicate}
 */
function not(predicate) {
  return input => !predicate(input);
}

exports.not = not;
