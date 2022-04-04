import { Predicate } from "@siteimprove/alfa-predicate";
import { Element } from "@siteimprove/alfa-dom";

const { equals, or } = Predicate;

/**
 * {@link https://act-rules.github.io/glossary/#disabled-element}
 */
export const isSemanticallyDisabled: Predicate<Element> = or(
  Element.isDisabled,
  Element.hasAttribute("aria-disabled", equals("true"))
);
