import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasRole } = DOM;
const { hasName, hasNamespace } = Element;
const { and, not, test } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r122",
  requirements: [
    Criterion.of("4.1.3"),
    Technique.of("G75"),
    Technique.of("G76"),
    Technique.of("G193"),
    Technique.of("G194"),
    Technique.of("H95"),
  ],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            isStatusMessage(device),
          ),
        );
      },

      expectations(target) {
        const hasProperRole = hasProperStatusRole(target, device);
        const hasProperAttributes = hasProperStatusAttributes(target, device);
        const hasAccessibleContent = hasAccessibleStatusContent(target, device);

        return {
          1: expectation(
            hasProperRole,
            () => Outcomes.HasProperRole,
            () => Outcomes.HasNoProperRole,
          ),

          2: expectation(
            hasProperAttributes,
            () => Outcomes.HasProperAttributes,
            () => Outcomes.HasNoProperAttributes,
          ),

          3: expectation(
            hasAccessibleContent,
            () => Outcomes.HasAccessibleContent,
            () => Outcomes.HasNoAccessibleContent,
          ),
        };
      },
    };
  },
});

/**
 * Check if an element is a status message
 */
function isStatusMessage(device: any): Predicate<Element> {
  return (element) => {
    // Check for ARIA live regions
    if (hasAriaLiveRegion(element)) {
      return true;
    }

    // Check for status role
    if (hasRole(device, "status")(element)) {
      return true;
    }

    // Check for alert role
    if (hasRole(device, "alert")(element)) {
      return true;
    }

    // Check for log role
    if (hasRole(device, "log")(element)) {
      return true;
    }

    // Check for marquee role
    if (hasRole(device, "marquee")(element)) {
      return true;
    }

    // Check for timer role
    if (hasRole(device, "timer")(element)) {
      return true;
    }

    // Check for elements that might contain status information
    if (hasStatusContent(element)) {
      return true;
    }

    return false;
  };
}

/**
 * Check for ARIA live region attributes
 */
function hasAriaLiveRegion(element: Element): boolean {
  return (
    element.hasAttribute("aria-live") ||
    element.hasAttribute("aria-atomic") ||
    element.hasAttribute("aria-relevant")
  );
}

/**
 * Check if element contains status-like content
 */
function hasStatusContent(element: Element): boolean {
  const text = element.textContent().toLowerCase();
  const statusKeywords = [
    "loading", "error", "success", "warning", "info", "status",
    "complete", "failed", "saved", "updated", "deleted", "created",
    "progress", "connecting", "disconnected", "online", "offline"
  ];

  return statusKeywords.some((keyword) => text.includes(keyword));
}

/**
 * Check if status message has proper role
 */
function hasProperStatusRole(element: Element, device: any): boolean {
  // Check for appropriate ARIA roles
  const appropriateRoles = ["status", "alert", "log", "marquee", "timer"];
  
  for (const role of appropriateRoles) {
    if (hasRole(device, role)(element)) {
      return true;
    }
  }

  // Check for aria-live region
  if (hasAriaLiveRegion(element)) {
    return true;
  }

  return false;
}

/**
 * Check if status message has proper attributes
 */
function hasProperStatusAttributes(element: Element, device: any): boolean {
  // For live regions, check aria-live
  if (hasAriaLiveRegion(element)) {
    const ariaLive = element.attribute("aria-live");
    if (ariaLive.isSome()) {
      const liveValue = ariaLive.get();
      if (["polite", "assertive"].includes(liveValue)) {
        return true;
      }
    }
  }

  // For status role, check if it's properly announced
  if (hasRole(device, "status")(element)) {
    return true;
  }

  // For alert role, it should be assertive
  if (hasRole(device, "alert")(element)) {
    const ariaLive = element.attribute("aria-live");
    return ariaLive.some((value) => value === "assertive") || !ariaLive.isSome();
  }

  return false;
}

/**
 * Check if status message has accessible content
 */
function hasAccessibleStatusContent(element: Element, device: any): boolean {
  // Check for accessible name
  if (DOM.hasAccessibleName(device)(element)) {
    return true;
  }

  // Check for text content
  const textContent = element.textContent().trim();
  if (textContent.length > 0) {
    return true;
  }

  // Check for aria-label or aria-labelledby
  if (element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby")) {
    return true;
  }

  // Check for aria-describedby
  if (element.hasAttribute("aria-describedby")) {
    return true;
  }

  return false;
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasProperRole = Ok.of(
    Diagnostic.of(`The status message has a proper ARIA role`),
  );

  export const HasNoProperRole = Err.of(
    Diagnostic.of(`The status message does not have a proper ARIA role`),
  );

  export const HasProperAttributes = Ok.of(
    Diagnostic.of(`The status message has proper ARIA attributes`),
  );

  export const HasNoProperAttributes = Err.of(
    Diagnostic.of(`The status message does not have proper ARIA attributes`),
  );

  export const HasAccessibleContent = Ok.of(
    Diagnostic.of(`The status message has accessible content`),
  );

  export const HasNoAccessibleContent = Err.of(
    Diagnostic.of(`The status message does not have accessible content`),
  );
}
