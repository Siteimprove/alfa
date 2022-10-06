import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Style } from "@siteimprove/alfa-style";

const { isElement } = Element;

/**
 * {@link https://w3c.github.io/wcag/guidelines/#dfn-large-scale}
 */
export function isLargeText(device: Device): Predicate<Text> {
  return (text) => {
    const parent = text.parent(Node.flatTree).filter(isElement);

    if (!parent.isSome()) {
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
