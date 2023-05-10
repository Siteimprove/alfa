import { Device } from "@siteimprove/alfa-device";
import { Declaration, Element, Node, Text } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import type { Longhands } from "../../longhands";
import { Style } from "../../style";

const { isElement } = Element;

/**
 * @public
 */
export function hasComputedStyle<N extends Longhands.Name>(
  name: N,
  predicate: Predicate<Style.Computed<N>, [source: Option<Declaration>]>,
  device: Device,
  context?: Context
): Predicate<Element | Text> {
  return function hasComputedStyle(node): boolean {
    return isElement(node)
      ? Style.from(node, device, context).computed(name).some(predicate)
      : node.parent(Node.flatTree).filter(isElement).some(hasComputedStyle);
  };
}
