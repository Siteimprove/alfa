import { Node, Element } from "@siteimprove/alfa-dom";
import * as dom from "@siteimprove/alfa-dom";
import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";

export function isTabbable(context: Node, device: Device): Predicate<Element> {
  return element => dom.isTabbable(element, context, device);
}
