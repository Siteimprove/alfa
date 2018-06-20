/**
 * @param {Array<string>} endings
 * @return {function(string): boolean}
 */
export function endsWith(...endings) {
  return string => endings.some(ending => string.endsWith(ending));
}
