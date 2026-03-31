/**
 * This package provides functionality for working with
 * {@link https://www.w3.org/TR/wai-aria/ | ARIA} and the accessibility tree.
 *
 * @packageDocumentation
 */

import * as dom from "./dom/dom.ts";

export * from "./attribute.ts";
export * from "./feature.ts";
export * from "./name/index.ts";
export * from "./role.ts";

export * from "./node.ts";

export * from "./node/container.ts";
export * from "./node/element.ts";
export * from "./node/inert.ts";
export * from "./node/text.ts";

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
