/**
 * @template T
 * @param {Iterable<T>} iterable
 * @param {(item: T) => void | false} iteratee
 */
function forEach(iterable, iteratee) {
  for (const item of iterable) {
    if (iteratee(item) === false) {
      break;
    }
  }
}

exports.forEach = forEach;
