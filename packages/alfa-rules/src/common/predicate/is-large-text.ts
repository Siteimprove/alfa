import { Device } from "@siteimprove/alfa-device";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Style } from "@siteimprove/alfa-style";

const { isElement } = Element;

/**
 * {@link https://w3c.github.io/wcag/guidelines/#dfn-large-scale}
 *
 * @remarks
 * Due to potential rounding issues in the px -> pt conversion,
 * we accept anything which is within 0.001pt of the threshold.
 */
export function isLargeText(device: Device): Predicate<Text> {
  return (text) => {
    const parent = text.parent(Node.flatTree).filter(isElement);

    if (!parent.isSome()) {
      return false;
    }

    const style = Style.from(parent.get(), device);

    const size = style.computed("font-size").value.withUnit("pt");

    if (size.value > 17.999 /* >= 18 */) {
      return true;
    }

    const weight = style.computed("font-weight").value;

    return size.value > 13.999 /* >= 14 */ && weight.value >= 700;
  };
}
