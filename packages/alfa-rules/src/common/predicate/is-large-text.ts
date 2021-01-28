import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Style } from "@siteimprove/alfa-style";

/**
 * @see https://w3c.github.io/wcag/guidelines/#dfn-large-scale
 */
export function isLargeText(device: Device): Predicate<Text> {
  return (text) => {
    const parent = text.parent({ flattened: true }).filter(Element.isElement);

    if (parent.isNone()) {
      return false;
    }

    const style = Style.from(parent.get(), device);

    const size = style.computed("font-size").value.withUnit("pt");

    if (size.value >= 18) {
      return true;
    }

    const weight = style.computed("font-weight").value;

    return size.value >= 14 && weight.value >= 700;
  };
}
