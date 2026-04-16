import type { Style } from "../style.ts";
import { isFlexContainer } from "./is-flex-container.ts";

/**
 * {@link https://drafts.csswg.org/css-flexbox-1/#flex-items}
 *
 * @internal
 */
export function isFlexItem(style: Style): boolean {
  return isFlexContainer(style.parent);
}
