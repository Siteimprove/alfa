import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isReplaced, isElement } = Element;
const { hasComputedStyle } = Style;

export function hasTransparentBackground(
  device: Device,
  context: Context = Context.empty()
): Predicate<Element> {
  return (element) => {
    if (
      isReplaced ||
      hasComputedStyle(
        "background-color",
        (color) => !Color.isTransparent(color),
        device,
        context
      ) ||
      hasComputedStyle(
        "background-image",
        (image) => image.values.length !== 0,
        device,
        context
      )
    ) {
      return false;
    }

    return element
      .children({
        nested: true,
        flattened: true,
      })
      .filter(isElement)
      .every(hasTransparentBackground(device, context));
  };
}
