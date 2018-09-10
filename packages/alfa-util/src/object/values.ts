import { keys } from "./keys";

/**
 * Get an array of the enumerable values owned by an object.
 *
 * NB: While this function is generic in the declared object type, the actual
 * type of the object will determine the values returned. It is therefore not
 * safe to use this function with anything but the most specific type of a
 * given object!
 */
export function values<T>(target: T): Array<T[keyof T]> {
  const result: Array<T[keyof T]> = [];

  for (const key of keys(target)) {
    result.push(target[key]);
  }

  return result;
}
