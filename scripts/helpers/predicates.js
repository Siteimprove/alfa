/**
 * @typedef {function(string): boolean} Predicate
 */

/**
 * @param {Array<string>} prefixes
 * @return {Predicate}
 */
function startsWith(...prefixes) {
  return input => prefixes.some(prefix => input.startsWith(prefix));
}

exports.startsWith = startsWith;

/**
 * @param {Array<string>} postfixes
 * @return {Predicate}
 */
function endsWith(...postfixes) {
  return input => postfixes.some(postfix => input.endsWith(postfix));
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
