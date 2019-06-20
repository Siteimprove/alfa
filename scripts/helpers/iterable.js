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

/**
 * @template T
 * @template G
 * @param {Iterable<T>} iterable
 * @param {(item: T) => G} grouper
 * @return {Iterable<[G, Iterable<T>]>}
 */
function groupBy(iterable, grouper) {
  const result = new Map();
  for (const item of iterable) {
    const group = grouper(item);
    const retrieved = result.get(group);
    if (retrieved === undefined) {
      result.set(group, [item]);
    } else {
      retrieved.push(item);
    }
  }
  return result;
}

exports.groupBy = groupBy;

/**
 * @template T
 * @template G
 * @param {Iterable<T>} iterable
 * @param {(item: T) => G} mapper
 */
function map(iterable, mapper) {
  const result = [];
  for (const item of iterable) {
    result.push(mapper(item));
  }
  return result;
}

exports.map = map;

/**
 * @template T
 * @template G
 * @template U
 * @param {Iterable<[T, G]>} iterable
 * @param {(item: [T, G]) => Iterable<U>} mapper
 */
function flatMap(iterable, mapper) {
  const result = [];
  for (const item of iterable) {
    result.push(...mapper(item));
  }
  return result;
}

exports.flatMap = flatMap;
