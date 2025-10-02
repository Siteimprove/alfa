import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasAccessibleName, hasRole } = DOM;
const { hasName, hasNamespace } = Element;
const { and, not, test } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r120",
  requirements: [
    Criterion.of("3.3.2"),
    Technique.of("G131"),
    Technique.of("H44"),
    Technique.of("H65"),
    Technique.of("H71"),
    Technique.of("H85"),
  ],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            isFormControl(device),
            isIncludedInTheAccessibilityTree(device),
          ),
        );
      },

      expectations(target) {
        const hasLabel = hasProperLabel(target, device);
        const hasInstructions = hasProperInstructions(target, device);

        return {
          1: expectation(
            hasLabel,
            () => Outcomes.HasProperLabel,
            () => Outcomes.HasNoProperLabel,
          ),

          2: expectation(
            hasInstructions,
            () => Outcomes.HasProperInstructions,
            () => Outcomes.HasNoProperInstructions,
          ),
        };
      },
    };
  },
});

/**
 * Check if an element is a form control
 */
function isFormControl(device: any): Predicate<Element> {
  return (element) => {
    const tagName = element.name.toLowerCase();
    const role = element.attribute("role");
    
    // Standard form controls
    const standardControls = [
      "input", "textarea", "select", "button", "fieldset", "legend"
    ];
    
    // ARIA form controls
    const ariaControls = [
      "textbox", "combobox", "listbox", "button", "checkbox", 
      "radio", "slider", "spinbutton", "switch"
    ];
    
    return (
      standardControls.includes(tagName) ||
      role.some((r) => ariaControls.includes(r)) ||
      (tagName === "input" && element.hasAttribute("type"))
    );
  };
}

/**
 * Check if element is included in accessibility tree
 */
function isIncludedInTheAccessibilityTree(device: any): Predicate<Element> {
  return DOM.isIncludedInTheAccessibilityTree(device);
}

/**
 * Check if form control has proper label
 */
function hasProperLabel(element: Element, device: any): boolean {
  // Check for accessible name
  if (hasAccessibleName(device)(element)) {
    return true;
  }

  // Check for explicit label association
  if (hasExplicitLabel(element)) {
    return true;
  }

  // Check for implicit label (label element wrapping)
  if (hasImplicitLabel(element)) {
    return true;
  }

  // Check for aria-label or aria-labelledby
  if (hasAriaLabel(element)) {
    return true;
  }

  return false;
}

/**
 * Check for explicit label association via for/id
 */
function hasExplicitLabel(element: Element): boolean {
  const id = element.attribute("id");
  if (!id.isSome()) {
    return false;
  }

  const document = element.document();
  const label = getElementDescendants(document, Node.fullTree).find(
    and(
      Element.hasName("label"),
      Element.hasNamespace(Namespace.HTML),
      Element.hasAttribute("for", id.get()),
    ),
  );

  return label.isSome();
}

/**
 * Check for implicit label (label element wrapping the control)
 */
function hasImplicitLabel(element: Element): boolean {
  const parent = element.parent();
  if (!parent.isSome()) {
    return false;
  }

  const parentElement = parent.get();
  if (!Element.isElement(parentElement)) {
    return false;
  }

  return (
    parentElement.name.toLowerCase() === "label" &&
    parentElement.namespace === Namespace.HTML
  );
}

/**
 * Check for aria-label or aria-labelledby
 */
function hasAriaLabel(element: Element): boolean {
  return (
    element.hasAttribute("aria-label") ||
    element.hasAttribute("aria-labelledby")
  );
}

/**
 * Check if form control has proper instructions
 */
function hasProperInstructions(element: Element, device: any): boolean {
  // Check for aria-describedby
  if (element.hasAttribute("aria-describedby")) {
    return true;
  }

  // Check for associated description text
  if (hasAssociatedDescription(element)) {
    return true;
  }

  // For some form controls, instructions might not be required
  const tagName = element.name.toLowerCase();
  const type = element.attribute("type");
  
  // Simple controls like buttons might not need instructions
  if (tagName === "button" || 
      (tagName === "input" && type.some((t) => ["submit", "button", "reset"].includes(t)))) {
    return true;
  }

  return false;
}

/**
 * Check for associated description text
 */
function hasAssociatedDescription(element: Element): boolean {
  const id = element.attribute("id");
  if (!id.isSome()) {
    return false;
  }

  const document = element.document();
  const description = getElementDescendants(document, Node.fullTree).find(
    and(
      Element.hasAttribute("aria-describedby", id.get()),
      Element.hasNamespace(Namespace.HTML),
    ),
  );

  return description.isSome();
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasProperLabel = Ok.of(
    Diagnostic.of(`The form control has a proper label`),
  );

  export const HasNoProperLabel = Err.of(
    Diagnostic.of(`The form control does not have a proper label`),
  );

  export const HasProperInstructions = Ok.of(
    Diagnostic.of(`The form control has proper instructions`),
  );

  export const HasNoProperInstructions = Err.of(
    Diagnostic.of(`The form control does not have proper instructions`),
  );
}
