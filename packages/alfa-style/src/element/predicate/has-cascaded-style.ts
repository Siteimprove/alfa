import { Device } from "@siteimprove/alfa-device";
import { Declaration, Element, Text } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { Property } from "../../property";
import { Style } from "../../style";

const { isElement } = Element;

export function hasCascadedStyle<N extends Property.Name>(
  name: N,
  predicate: Predicate<Style.Cascaded<N>, [source: Option<Declaration>]>,
  device: Device,
  context?: Context
): Predicate<Element | Text> {
  return function hasCascadedStyle(node): boolean {
    return isElement(node)
      ? Style.from(node, device, context)
          .cascaded(name)
          .some((value) => value.some(predicate))
      : node
          .parent({ flattened: true })
          .filter(isElement)
          .some(hasCascadedStyle);
  };
}
