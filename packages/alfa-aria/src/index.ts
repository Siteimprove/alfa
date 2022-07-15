/**
 * This package provides functionality for working with
 * {@link https://www.w3.org/TR/wai-aria/ | ARIA} and the accessibility tree.
 *
 * @packageDocumentation
 */

import * as dom from "./dom/dom";

export * from "./attribute";
export * from "./feature";
export * from "./name";
export * from "./role";

export * from "./node";

export * from "./node/container";
export * from "./node/element";
export * from "./node/inert";
export * from "./node/text";

/**
 * Helpers and Predicates for accessibility aspects of DOM objects
 *
 * @public
 */
export namespace DOM {
  export const {
    hasAccessibleName,
    hasExplicitRole,
    hasHeadingLevel,
    hasImplicitRole,
    hasIncorrectRoleWithoutName,
    hasNonDefaultRole,
    hasNonEmptyAccessibleName,
    hasRole,
    isIgnored,
    isIncludedInTheAccessibilityTree,
    isMarkedDecorative,
    isPerceivableForAll,
    isProgrammaticallyHidden,
    isSemanticallyDisabled,
  } = dom;
}
