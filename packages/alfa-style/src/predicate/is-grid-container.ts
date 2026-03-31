import type { Style } from "../style.ts";

/**
 * {@link https://www.w3.org/TR/css-grid-2/#grid-container}
 *
 * @internal
 */
export function isGridContainer(style: Style): boolean {
  const [_, inside] = style.computed("display").value.values;

  return inside?.value === "grid";
}
