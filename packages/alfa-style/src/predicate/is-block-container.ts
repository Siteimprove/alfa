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
    outside.is("block") ||
    // inline-block
    (outside.is("inline") && (inside?.is("flow-root") ?? false))
  );
}

/**
 * {@link https://drafts.csswg.org/css-display/#the-display-properties}
 * {@link https://drafts.csswg.org/css2/#block-boxes}
 *
 * @remarks
 * This one is even worse. This is quite an approximation, that should work
 * for some time. We may need a better model of CSS boxes to get this right.
 *
 * @internal
 */
export function isBlockContainerWithInlineFormattingContext(
  style: Style,
): boolean {
  const [outside, inside] = style.computed("display").value.values;

  // Inline blocks are not block containers
  // The exact rules for when block containers generate inline formatting
  // contexts are not clear.
  return outside.is("block") && (inside?.is("flow") ?? false);
}
