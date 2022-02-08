import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import { getInterposedDescendant } from "../dom/get-interposed-descendant";

export function hasInterposedDescendant(device: Device): Predicate<Element> {
  return (element) => !getInterposedDescendant(device, element).isEmpty();
}
