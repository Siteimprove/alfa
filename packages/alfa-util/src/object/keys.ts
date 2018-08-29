/**
 * Get an array of the enumerable keys owned by an object.
 *
 * NB: While this function is generic in the declared object type, the actual
 * type of the object will determine the keys returned. It is therefore not safe
 * to use this function with anything but the most specific type of a given
 * object!
 */
export function keys<T>(target: T): Array<keyof T> {
  return Object.keys(target) as Array<keyof T>;
}
