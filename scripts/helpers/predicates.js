/**
 * @template T
 * @typedef {(item: T) => boolean} Predicate
 */

/**
 * @param {Array<string>} prefixes
 * @return {Predicate<string>}
 */
function startsWith(...prefixes) {
  return input => prefixes.some(prefix => input.startsWith(prefix));
}

exports.startsWith = startsWith;

/**
 * @param {Array<string>} postfixes
 * @return {Predicate<string>}
 */
function endsWith(...postfixes) {
  return input => postfixes.some(postfix => input.endsWith(postfix));
}

exports.endsWith = endsWith;

/**
 * @template T
 * @param {Predicate<T>} predicate
 * @return {Predicate<T>}
 */
function not(predicate) {
  return input => !predicate(input);
}

exports.not = not;

/**
 * @template T
 * @param {Predicate<T>} left
 * @param {Predicate<T>} right
 * @return {Predicate<T>}
 */
function and(left, right) {
  return input => left(input) && right(input);
}

exports.and = and;

/**
 * @template T
 * @param {Predicate<T>} left
 * @param {Predicate<T>} right
 * @return {Predicate<T>}
 */
function or(left, right) {
  return input => left(input) || right(input);
}

exports.or = or;
