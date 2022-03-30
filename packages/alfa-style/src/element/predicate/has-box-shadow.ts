import { Color, Keyword, Shadow } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Context } from "@siteimprove/alfa-selector";

import { Style } from "../../style";

/**
 * Known assumptions:
 * * Without being transparent, a shadow could have the same color of the background, and thus not be visible.
 *   This is even more difficult to detect since the shadow is rendered above the ancestors, not the element;
 *   and of course, non-solid background are hard to handle.
 * * In a shadows stack, a shadow can be entirely covered by the top ones; if the top ones have the same color
 *   as the background, then the bottom one is apparently visible but actually hidden below.
 *   This is hard to detect also because various blurring or spreading sizes make it worse…
 *
 * Therefore, we consider that these case are rare enough. We detect some obvious cases of invisible shadows
 * and assume the rest are visible…
 */
export function hasBoxShadow(
  device: Device,
  context?: Context
): Predicate<Element> {
  return (element) => {
    const shadow = Style.from(element, device, context).computed(
      "box-shadow"
    ).value;

    return !Keyword.isKeyword(shadow) && Iterable.some(shadow, isVisibleShadow);
  };
}

function isVisibleShadow(shadow: Shadow): boolean {
  // If the shadow color is transparent, it is not visible.
  if (Color.isTransparent(shadow.color)) {
    return false;
  }

  // If the shadow has no horizontal or vertical offset, no blur and no spread, it is not visible
  if (
    shadow.vertical.value === 0 &&
    shadow.horizontal.value === 0 &&
    shadow.blur.value === 0 &&
    shadow.spread.value === 0
  ) {
    return false;
  }

  return true;
}
