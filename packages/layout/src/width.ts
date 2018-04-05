import { Layout } from "./types";

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-width
 */
export function width(layout: Layout): number {
  return layout.width;
}
