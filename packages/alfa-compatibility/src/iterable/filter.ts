import { List } from "@siteimprove/alfa-collection";
import { BrowserSpecific } from "../browser-specific";
import { reduce } from "./reduce";

export function filter<T>(
  values: BrowserSpecific.Maybe<Iterable<T>>,
  predicate: (value: T) => BrowserSpecific.Maybe<boolean>
): BrowserSpecific.Maybe<Iterable<T>>;

export function filter<T>(
  values: Iterable<T>,
  predicate: (value: T) => boolean
): Iterable<T>;

export function filter<T>(
  values: BrowserSpecific.Maybe<Iterable<T>>,
  predicate: (value: T) => BrowserSpecific.Maybe<boolean>
): BrowserSpecific.Maybe<Iterable<T>> {
  return reduce<T, List<T>>(
    values,
    (filtered, value) => {
      return BrowserSpecific.map(predicate(value), include => {
        return include ? filtered.push(value) : filtered;
      });
    },
    List()
  );
}
