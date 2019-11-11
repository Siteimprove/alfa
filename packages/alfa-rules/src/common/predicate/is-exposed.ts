import * as aria from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";

export function isExposed(context: Node, device: Device): Predicate<Element> {
  return element =>
    Iterable.some(
      aria.isExposed(element, context, device),
      ([isExposed]) => isExposed
    );
}
