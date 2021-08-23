import { Device } from "@siteimprove/alfa-device";
import { Declaration, Element, Text } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Property, Style } from "@siteimprove/alfa-style";

const { isElement } = Element;

export function hasComputedStyle<N extends Property.Name>(
  name: N,
  predicate: Predicate<Style.Computed<N>, [source: Option<Declaration>]>,
  device: Device,
  context?: Context
): Predicate<Element | Text> {
  return function hasComputedStyle(node): boolean {
    return isElement(node)
      ? Style.from(node, device, context).computed(name).some(predicate)
      : node
          .parent({ flattened: true })
          .filter(isElement)
          .some(hasComputedStyle);
  };
}
