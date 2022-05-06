import { Cache } from "@siteimprove/alfa-cache";
import { Color, Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "../../style";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isReplaced, isElement } = Element;


const { or, test } = Predicate;

const cache = Cache.empty<Device, Cache<Context, Cache<Element, boolean>>>();

export function hasTransparentBackground(
  device: Device,
  context: Context = Context.empty()
): Predicate<Element> {
  return (element) =>
    cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(element, () => {
        if (
          test(
            or(
              isReplaced,
              Style.hasComputedStyle(
                "background-color",
                (color) => !Color.isTransparent(color),
                device,
                context
              ),
              Style.hasComputedStyle(
                "background-image",
                (image) =>
                  !(
                    Keyword.isKeyword(image.values[0]) &&
                    image.values[0].equals(Keyword.of("none"))
                  ),
                device,
                context
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
      });
}
