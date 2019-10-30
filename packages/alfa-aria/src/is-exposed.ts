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
import { getRole } from "./get-role";
import { isVisible } from "./is-visible";
import * as Roles from "./roles";

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

  return getRole(node, context, device).map(role =>
    role
      .filter(role => role !== Roles.Presentation && role !== Roles.None)
      .map(() => isVisible(node, context, device))
      .getOr(true)
  );
}
