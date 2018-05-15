import { keys } from "./keys";

/**
 * Get an array of the enumerable entries (key-value pairs) owned by an object.
 *
 * NB: While this function is generic in the declared object type, the actual
 * type of the object will determine the entries returned. It is therefore not
 * safe to use this function with anything but the most specific type of a
 * given object!
 */
export function entries<T, K extends keyof T>(target: T): Array<[K, T[K]]> {
  const entries: Array<[K, T[K]]> = [];

  for (const key of keys(target)) {
    entries.push([key as K, target[key] as T[K]]);
  }

  return entries;
}
