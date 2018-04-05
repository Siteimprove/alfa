import { Layout } from "./types";

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-right
 */
export function bottom(layout: Layout): number {
  return Math.max(layout.y, layout.y + layout.height);
}
