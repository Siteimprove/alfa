import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Property, Style } from "@siteimprove/alfa-style";

const { isElement } = Element;

export function hasComputedStyle<N extends Property.Name>(
  device: Device,
  context?: Context
): (
  name: N,
  predicate: Predicate<Style.Computed<N>>
) => Predicate<Element | Text> {
  return function hasComputedStyle(
    name: N,
    predicate: Predicate<Style.Computed<N>>
  ): Predicate<Element | Text> {
    return (node) =>
      isElement(node)
        ? Style.from(node, device, context).computed(name).some(predicate)
        : node
            .parent({ flattened: true })
            .filter(isElement)
            .some(hasComputedStyle(name, predicate));
  };
}
