import { Layout } from "./types";

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-right
 */
export function left(layout: Layout): number {
  return Math.min(layout.x, layout.x + layout.width);
}
