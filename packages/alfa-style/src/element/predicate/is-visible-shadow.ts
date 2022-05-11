import { Color, Shadow } from "@siteimprove/alfa-css";

/**
 * @public
 * */
export function isVisibleShadow(shadow: Shadow): boolean {
  return !isInvisibleShadow(shadow);
}

function isInvisibleShadow(shadow: Shadow): boolean {
  // The shadow is not visible if:
  // - color is transparent
  // - no horizontal or vertical offset, no blur and no spread
  return Color.isTransparent(shadow.color) ||
    (shadow.vertical.value === 0 &&
      shadow.horizontal.value === 0 &&
      shadow.blur.value === 0 &&
      shadow.spread.value === 0)
    ? true
    : false;
}
