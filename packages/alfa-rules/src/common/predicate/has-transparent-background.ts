/// <reference lib="dom" />
import { Color, Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isReplaced, isElement } = Element;
const { hasComputedStyle } = Style;

const { or, tee, test } = Predicate;

export function hasTransparentBackground(
  device: Device,
  context: Context = Context.empty()
): Predicate<Element> {
  return (element) => {
    if (
      test(
        or(
          isReplaced,
          hasComputedStyle(
            "background-color",
            (color) => !Color.isTransparent(color),
            device,
            context
          ),
          tee(
            hasComputedStyle(
              "background-image",
              (image) =>
                !(
                  Keyword.isKeyword(image.values[0]) &&
                  image.values[0].equals(Keyword.of("none"))
                ),
              device,
              context
            ),
            (elt, res) => console.log(res)
          )
        ),
        element
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
