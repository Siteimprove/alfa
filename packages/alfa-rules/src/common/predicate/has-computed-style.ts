import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";
import { Property, Style } from "@siteimprove/alfa-style";

export function hasComputedStyle<N extends Property.Name>(
  name: N,
  predicate: Predicate<Style.Computed<N>>,
  device: Device,
  context?: Context
): Predicate<Element> {
  return (element) =>
    Style.from(element, device, context).computed(name).some(predicate);
}
