import { Branched } from "@siteimprove/alfa-branched";
import { Browser } from "@siteimprove/alfa-compatibility";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  getParentElement,
  isText,
  Node,
  Text
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { getRole } from "./get-role";
import { isVisible } from "./is-visible";

const { not, equals, test } = Predicate;

export function isExposed(
  node: Element | Text,
  context: Node,
  device: Device
): Branched<boolean, Browser.Release> {
  if (isText(node)) {
    return getParentElement(node, context, { flattened: true })
      .map(parentElement => isExposed(parentElement, context, device))
      .getOrElse(() => Branched.of(false));
  }

  return getRole(node, context).map(role =>
    role
      .filter(role => test(not(equals("presentation", "none")), role.name))
      .filter(() => isVisible(node, context, device))
      .isSome()
  );
}
