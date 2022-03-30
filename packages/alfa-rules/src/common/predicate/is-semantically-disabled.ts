import { Predicate } from "@siteimprove/alfa-predicate";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { hasValue } from "./has-value";
import { Refinement } from "@siteimprove/alfa-refinement";

const { or, equals } = Predicate;
const { and } = Refinement;

/**
 * {@link https://act-rules.github.io/glossary/#disabled-element}
 */
export const isSemanticallyDisabled: Predicate<Element> = or(
  Element.isDisabled,
  Element.hasAttribute(
    and(Attribute.hasName("aria-disabled"), hasValue(equals("true")))
  )
);
