import { Layout } from "./types";

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-right
 */
export function right(layout: Layout): number {
  return Math.max(layout.x, layout.x + layout.width);
}
