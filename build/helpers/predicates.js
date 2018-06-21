/**
 * @typedef {function(string): boolean} Predicate
 */

/**
 * @param {Array<string>} endings
 * @return {Predicate}
 */
export function endsWith(...endings) {
  return input => endings.some(ending => input.endsWith(ending));
}

/**
 * @param {Predicate} predicate
 * @return {Predicate}
 */
export function not(predicate) {
  return input => !predicate(input);
}
