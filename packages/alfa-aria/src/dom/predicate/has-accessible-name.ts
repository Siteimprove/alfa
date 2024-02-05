import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { hasValue, Name } from "../../name";
import { Node } from "../../node";

import { hasName } from "../../node/predicate";

const { test } = Predicate;

/**
 * @public
 */
export function hasAccessibleName<T extends Element | Text>(
  device: Device,
  predicate?: Predicate<Name>,
): Predicate<T>;

/**
 * @public
 */
export function hasAccessibleName<T extends Element | Text>(
  device: Device,
  name: string,
  ...rest: Array<string>
): Predicate<T>;

export function hasAccessibleName<T extends Element | Text>(
  device: Device,
  nameOrPredicate: Predicate<Name> | string = () => true,
  ...names: Array<string>
): Predicate<T> {
  const predicate =
    typeof nameOrPredicate === "string"
      ? hasValue(nameOrPredicate, ...names)
      : nameOrPredicate;

  return (node) => test(hasName(predicate), Node.from(node, device));
}
