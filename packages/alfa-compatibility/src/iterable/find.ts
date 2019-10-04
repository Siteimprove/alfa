import { Option, Some } from "@siteimprove/alfa-util";
import { BrowserSpecific } from "../browser-specific";
import { reduce } from "./reduce";

export function find<T>(
  values: BrowserSpecific.Maybe<Iterable<Option<T>>>,
  predicate: (value: Some<T>) => BrowserSpecific.Maybe<boolean>
): BrowserSpecific.Maybe<Option<T>>;

export function find<T>(
  values: Iterable<Option<T>>,
  predicate: (value: Some<T>) => boolean
): Option<T>;

export function find<T>(
  values: BrowserSpecific.Maybe<Iterable<Option<T>>>,
  predicate: (value: Some<T>) => BrowserSpecific.Maybe<boolean>
): BrowserSpecific.Maybe<Option<T>> {
  return reduce<Option<T>, Option<T>>(
    values,
    (found, value) => {
      if (found === null && value !== null) {
        return BrowserSpecific.map(predicate(value), match =>
          match ? value : null
        );
      }

      return found;
    },
    null
  );
}
