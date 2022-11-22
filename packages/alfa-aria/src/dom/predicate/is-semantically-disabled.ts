import { Predicate } from "@siteimprove/alfa-predicate";
import { Element } from "@siteimprove/alfa-dom";

const { equals, or } = Predicate;

/**
 * Checks if an element is semantically disabled.
 *
 * While this only uses DOM properties, this is thematically related to
 * accessibility and aria-* attributes and therefore lives in alfa-aria.
 *
 * {@link https://alfa.siteimprove.com/terms/disabled}
 *
 * @public
 */
export const isSemanticallyDisabled: Predicate<Element> = or(
  Element.isActuallyDisabled,
  Element.hasAttribute("aria-disabled", equals("true"))
);
