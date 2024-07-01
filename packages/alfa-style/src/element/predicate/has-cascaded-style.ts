import type { Device } from "@siteimprove/alfa-device";
import type { Declaration, Text } from "@siteimprove/alfa-dom";
import { Element, Node } from "@siteimprove/alfa-dom";
import type { Option } from "@siteimprove/alfa-option";
import type { Predicate } from "@siteimprove/alfa-predicate";
import type { Context } from "@siteimprove/alfa-selector";

import type { Longhands } from "../../longhands.js";

import { Style } from "../../style.js";

const { isElement } = Element;

/**
 * @public
 */
export function hasCascadedStyle<N extends Longhands.Name>(
  name: N,
  predicate: Predicate<Style.Cascaded<N>, [source: Option<Declaration>]>,
  device: Device,
  context?: Context,
): Predicate<Element | Text> {
  return function hasCascadedStyle(node): boolean {
    return isElement(node)
      ? Style.from(node, device, context)
          .cascaded(name)
          .some((value) => value.some(predicate))
      : node.parent(Node.flatTree).filter(isElement).some(hasCascadedStyle);
  };
}
