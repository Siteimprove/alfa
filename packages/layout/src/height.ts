import { Layout } from "./types";

/**
 * @see https://www.w3.org/TR/geometry/#dom-domrectreadonly-domrect-height
 */
export function height(layout: Layout): number {
  return layout.height;
}
