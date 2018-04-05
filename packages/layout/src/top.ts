import { Layout } from "./types";

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-top
 */
export function top(layout: Layout): number {
  return Math.min(layout.y, layout.y + layout.height);
}
