import type { Style } from "../style.js";

/**
 * {@link https://drafts.csswg.org/css-flexbox-1/#flex-container}
 *
 * @internal
 */
export function isFlexContainer(style: Style): boolean {
  const [_, inside] = style.computed("display").value.values;

  return inside?.value === "flex";
}
