import { Color, Shadow } from "@siteimprove/alfa-css";

/**
 * @public
 * */

export function isVisibleShadow(shadow: Shadow): boolean {
  // If the shadow color is transparent, it is not visible.
  if (Color.isTransparent(shadow.color)) {
    return false;
  }

  // If the shadow has no horizontal or vertical offset, no blur and no spread, it is not visible
  // For text-shadow property, spread value is not allowed
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
