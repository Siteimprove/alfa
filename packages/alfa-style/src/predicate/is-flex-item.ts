import type { Style } from "../style.js";
import { isFlexContainer } from "./is-flex-container.js";

/**
 * {@link https://drafts.csswg.org/css-flexbox-1/#flex-items}
 *
 * @internal
 */
export function isFlexItem(style: Style): boolean {
  return isFlexContainer(style.parent);
}
