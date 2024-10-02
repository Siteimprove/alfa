import type { Style } from "../style.js";

/**
 * {@link https://drafts.csswg.org/css-display/#the-display-properties}
 * {@link https://drafts.csswg.org/css2/#block-boxes}
 *
 * @remarks
 * It is not fully clear what "block container" really are and, notably,
 * whether "block-level" elements should be treated as such. It seems to
 * work that way…
 * {@link https://drafts.csswg.org/css-display/#block-level}
 * {@link https://drafts.csswg.org/css-display/#block-container}
 * This affects `flex`, `grid`, `block ruby`, `table`, and `list-item` who
 * have an outer display of `block` but are not listed as "block containers".
 *
 * @internal
 */
export function isBlockContainer(style: Style): boolean {
  const [outside, inside] = style.computed("display").value.values;

  return (
    // block
    outside.value === "block" ||
    // inline-block
    (outside.value === "inline" && inside?.value === "flow-root")
  );
}
