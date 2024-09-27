import type { Style } from "../style.js";

/**
 * {@link https://drafts.csswg.org/css2/#block-boxes}
 *
 * @internal
 */
export function isBlockContainer(style: Style): boolean {
  const [outside] = style.computed("display").value.values;

  // `table` and `list-item` both set the outside value as `block`.
  return outside.value === "block";
}
