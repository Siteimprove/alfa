import { Color, Shadow } from "@siteimprove/alfa-css";

/**
 * @public
 * */
export function isVisibleShadow(shadow: Shadow): boolean {
  return !isInvisibleShadow(shadow);
}

function isInvisibleShadow(shadow: Shadow): boolean {
  return (
    // Transparent shadows are not visible
    Color.isTransparent(shadow.color) ||
    // Shadows with no offset, blur and spread are not visible
    (shadow.vertical.value === 0 &&
      shadow.horizontal.value === 0 &&
      shadow.blur.value === 0 &&
      shadow.spread.value === 0)
      );
}
