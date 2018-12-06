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

/**
 * @param {Predicate} left
 * @param {Predicate} right
 * @return {Predicate}
 */
function and(left, right) {
  return input => left(input) && right(input);
}

exports.and = and;

/**
 * @param {Predicate} left
 * @param {Predicate} right
 * @return {Predicate}
 */
function or(left, right) {
  return input => left(input) || right(input);
}

exports.or = or;
