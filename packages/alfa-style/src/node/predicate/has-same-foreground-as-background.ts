import { Cache } from "@siteimprove/alfa-cache";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { hasComputedStyle } from "../../element/predicate/has-computed-style";
import { Longhands } from "../../longhands";
import { Style } from "../../style";

const { or, test } = Predicate;

const cache = Cache.empty<Device, Cache<Context, Cache<Text, boolean>>>();

/**
 * Checks if an text has the same foreground color as its background.
 *
 * @remarks
 * This currently does not look at layout information. It probably should.
 * But texts (and elements) that are moved out of their positioning ancestors
 * could be anywhere on the page and finding the actual background requires
 * looking at potentially any element of the page. This is too complex to
 * implement before we encounter problems due to this.
 *
 * @internal
 */
export function hasSameForegroundAsBackground(
  device: Device,
  context: Context = Context.empty(),
): Predicate<Text> {
  return (text) =>
    cache
      .get(device, Cache.empty)
      .get(context, Cache.empty)
      .get(text, () =>
        test(
          // We should correctly resolve colors (including opacity, layers,
          // "currentcolor" keyword, system colors, …)
          // However, we assume that hiding content with color is mostly made
          // with solid `color` and `background-color`, so we stick on a simple
          // check for now.
          hasComputedStyle(
            "color",
            (foreground) =>
              text
                .ancestors()
                .filter(Element.isElement)
                // first ancestor with a non-inherited background property
                .find(
                  or(
                    hasNonColorBackgroundProperty(device, context),
                    hasNonTransparentBackgroundColor(device, context),
                  ),
                )
                // If a non color `background-*` is set, assume it will make
                // the background different from the foreground color.
                .reject(hasNonColorBackgroundProperty(device, context))
                .map(
                  (ancestor) =>
                    Style.from(ancestor, device, context).computed(
                      "background-color",
                    ).value,
                )
                .some((background) => background.equals(foreground)),
            device,
            context,
          ),
          text,
        ),
      );
}

function hasNonColorBackgroundProperty(
  device: Device,
  context: Context = Context.empty(),
): Predicate<Element> {
  return (element) => {
    const style = Style.from(element, device, context);

    for (const property of [
      "attachment",
      "clip",
      "image",
      "origin",
      "position-x",
      "position-y",
      "repeat-x",
      "repeat-y",
      "size",
    ] as const) {
      if (
        Equatable.equals(
          style.computed(`background-${property}`).value,
          Longhands.get(`background-${property}`).initial,
        )
      ) {
        continue;
      }
      return true;
    }

    return false;
  };
}

function hasNonTransparentBackgroundColor(
  device: Device,
  context: Context = Context.empty(),
): Predicate<Element> {
  return (element) =>
    !Color.isTransparent(
      Style.from(element, device, context).computed("background-color").value,
    );
}
