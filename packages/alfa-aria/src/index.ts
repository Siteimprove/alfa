/**
 * This package provides functionality for working with
 * {@link https://www.w3.org/TR/wai-aria/ | ARIA} and the accessibility tree.
 *
 * @packageDocumentation
 */

import * as dom from "./dom/dom.js";

export * from "./attribute.js";
export * from "./feature.js";
export * from "./name/index.js";
export * from "./role.js";

export * from "./node.js";

export * from "./node/container.js";
export * from "./node/element.js";
export * from "./node/inert.js";
export * from "./node/text.js";

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
