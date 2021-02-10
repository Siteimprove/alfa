import { Predicate } from "@siteimprove/alfa-predicate";

import { Name } from "../../name";

const { equals } = Predicate;

export function hasValue(predicate: Predicate<string>): Predicate<Name>;

export function hasValue(
  value: string,
  ...rest: Array<string>
): Predicate<Name>;

export function hasValue(
  valueOrPredicate: string | Predicate<string>,
  ...values: Array<string>
): Predicate<Name> {
  let predicate: Predicate<string>;

  if (typeof valueOrPredicate === "function") {
    predicate = valueOrPredicate;
  } else {
    predicate = equals(valueOrPredicate, ...values);
  }

  return (name) => predicate(name.value);
}
