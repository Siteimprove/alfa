import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { withDocumentElement } from "../common/applicability/with-document-element.js";
import { Scope, Stability } from "../tags/index.js";

const { hasRole } = DOM;
const { hasName, hasNamespace } = Element;
const { and, not, test } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r119",
  requirements: [
    Criterion.of("2.4.1"),
    Technique.of("G1"),
    Technique.of("G123"),
    Technique.of("H69"),
  ],
  tags: [Scope.Page, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return withDocumentElement(document, (html) =>
          getElementDescendants(html, Node.fullTree).filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("a"),
              hasRole(device, "link"),
              isSkipLink(device),
            ),
          ),
        );
      },

      expectations(target) {
        const hasValidTarget = checkSkipLinkTarget(target, device);
        const hasVisibleText = hasSkipLinkText(target);
        const isProperlyPositioned = isSkipLinkPositioned(target, device);

        return {
          1: expectation(
            hasValidTarget,
            () => Outcomes.HasValidTarget,
            () => Outcomes.HasInvalidTarget,
          ),

          2: expectation(
            hasVisibleText,
            () => Outcomes.HasVisibleText,
            () => Outcomes.HasNoVisibleText,
          ),

          3: expectation(
            isProperlyPositioned,
            () => Outcomes.IsProperlyPositioned,
            () => Outcomes.IsNotProperlyPositioned,
          ),
        };
      },
    };
  },
});

/**
 * Check if an element is a skip link
 */
function isSkipLink(device: any): Predicate<Element> {
  return (element) => {
    const href = element.attribute("href");
    if (!href.isSome()) {
      return false;
    }

    const hrefValue = href.get();
    // Check if href starts with # (internal link)
    return hrefValue.startsWith("#");
  };
}

/**
 * Check if skip link has a valid target
 */
function checkSkipLinkTarget(skipLink: Element, device: any): boolean {
  const href = skipLink.attribute("href");
  if (!href.isSome()) {
    return false;
  }

  const hrefValue = href.get();
  if (!hrefValue.startsWith("#")) {
    return false;
  }

  const targetId = hrefValue.substring(1);
  if (!targetId) {
    return false;
  }

  // Find the target element
  const document = skipLink.document();
  const target = getElementDescendants(document, Node.fullTree).find(
    and(
      Element.hasId(targetId),
      isSkipLinkTarget(device),
    ),
  );

  return target.isSome();
}

/**
 * Check if an element is a valid skip link target
 */
function isSkipLinkTarget(device: any): Predicate<Element> {
  return (element) => {
    // Valid targets are typically main content areas
    const role = element.attribute("role");
    const tagName = element.name.toLowerCase();
    
    return (
      tagName === "main" ||
      role.some((r) => r === "main") ||
      element.hasAttribute("id") // Any element with ID can be a target
    );
  };
}

/**
 * Check if skip link has visible text
 */
function hasSkipLinkText(skipLink: Element): boolean {
  const textContent = skipLink.textContent();
  return textContent.trim().length > 0;
}

/**
 * Check if skip link is properly positioned (typically at the beginning)
 */
function isSkipLinkPositioned(skipLink: Element, device: any): boolean {
  const document = skipLink.document();
  const body = getElementDescendants(document, Node.fullTree).find(
    and(
      Element.hasName("body"),
      Element.hasNamespace(Namespace.HTML),
    ),
  );

  if (!body.isSome()) {
    return false;
  }

  // Check if skip link is among the first few focusable elements
  const allFocusable = getElementDescendants(body.get(), Node.fullTree)
    .filter(DOM.isFocusable(device))
    .toArray();

  const skipLinkIndex = allFocusable.findIndex((element) =>
    element.equals(skipLink),
  );

  // Skip link should be among the first 3 focusable elements
  return skipLinkIndex >= 0 && skipLinkIndex < 3;
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasValidTarget = Ok.of(
    Diagnostic.of(`The skip link has a valid target`),
  );

  export const HasInvalidTarget = Err.of(
    Diagnostic.of(`The skip link does not have a valid target`),
  );

  export const HasVisibleText = Ok.of(
    Diagnostic.of(`The skip link has visible text`),
  );

  export const HasNoVisibleText = Err.of(
    Diagnostic.of(`The skip link does not have visible text`),
  );

  export const IsProperlyPositioned = Ok.of(
    Diagnostic.of(`The skip link is properly positioned`),
  );

  export const IsNotProperlyPositioned = Err.of(
    Diagnostic.of(`The skip link is not properly positioned`),
  );
}
