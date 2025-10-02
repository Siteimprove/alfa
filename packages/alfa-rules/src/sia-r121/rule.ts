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
  uri: "https://alfa.siteimprove.com/rules/sia-r121",
  requirements: [
    Criterion.of("3.3.3"),
    Technique.of("G83"),
    Technique.of("G84"),
    Technique.of("G85"),
    Technique.of("H44"),
    Technique.of("H89"),
  ],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            isFormControlWithError(device),
          ),
        );
      },

      expectations(target) {
        const hasErrorIdentification = hasProperErrorIdentification(target, device);
        const hasErrorDescription = hasProperErrorDescription(target, device);
        const hasErrorSuggestion = hasErrorSuggestion(target, device);

        return {
          1: expectation(
            hasErrorIdentification,
            () => Outcomes.HasErrorIdentification,
            () => Outcomes.HasNoErrorIdentification,
          ),

          2: expectation(
            hasErrorDescription,
            () => Outcomes.HasErrorDescription,
            () => Outcomes.HasNoErrorDescription,
          ),

          3: expectation(
            hasErrorSuggestion,
            () => Outcomes.HasErrorSuggestion,
            () => Outcomes.HasNoErrorSuggestion,
          ),
        };
      },
    };
  },
});

/**
 * Check if an element is a form control with error
 */
function isFormControlWithError(device: any): Predicate<Element> {
  return (element) => {
    // Check if it's a form control
    if (!isFormControl(element)) {
      return false;
    }

    // Check for error indicators
    return (
      hasAriaInvalid(element) ||
      hasErrorClass(element) ||
      hasErrorAttribute(element) ||
      hasNearbyErrorMessage(element)
    );
  };
}

/**
 * Check if element is a form control
 */
function isFormControl(element: Element): boolean {
  const tagName = element.name.toLowerCase();
  const role = element.attribute("role");
  
  const standardControls = [
    "input", "textarea", "select", "button", "fieldset"
  ];
  
  const ariaControls = [
    "textbox", "combobox", "listbox", "checkbox", 
    "radio", "slider", "spinbutton", "switch"
  ];
  
  return (
    standardControls.includes(tagName) ||
    role.some((r) => ariaControls.includes(r))
  );
}

/**
 * Check for aria-invalid attribute
 */
function hasAriaInvalid(element: Element): boolean {
  const ariaInvalid = element.attribute("aria-invalid");
  return ariaInvalid.some((value) => value === "true" || value === "grammar" || value === "spelling");
}

/**
 * Check for error-related CSS classes
 */
function hasErrorClass(element: Element): boolean {
  const className = element.attribute("class");
  if (!className.isSome()) {
    return false;
  }

  const errorClasses = ["error", "invalid", "has-error", "is-invalid", "field-error"];
  return errorClasses.some((errorClass) => 
    className.get().toLowerCase().includes(errorClass)
  );
}

/**
 * Check for error-related attributes
 */
function hasErrorAttribute(element: Element): boolean {
  return (
    element.hasAttribute("data-error") ||
    element.hasAttribute("data-invalid") ||
    element.hasAttribute("aria-errormessage")
  );
}

/**
 * Check for nearby error message
 */
function hasNearbyErrorMessage(element: Element): boolean {
  const document = element.document();
  
  // Look for error messages in nearby elements
  const nearbyElements = [
    ...element.precedingSiblings(Node.fullTree),
    ...element.followingSiblings(Node.fullTree),
    ...element.parent().map((p) => p.children(Node.fullTree)).getOr([]),
  ];

  return nearbyElements.some((sibling) => {
    if (!Element.isElement(sibling)) {
      return false;
    }

    const text = sibling.textContent().toLowerCase();
    const errorKeywords = ["error", "invalid", "required", "missing", "incorrect"];
    
    return errorKeywords.some((keyword) => text.includes(keyword));
  });
}

/**
 * Check if error is properly identified
 */
function hasProperErrorIdentification(element: Element, device: any): boolean {
  // Check aria-invalid
  if (hasAriaInvalid(element)) {
    return true;
  }

  // Check aria-errormessage
  if (element.hasAttribute("aria-errormessage")) {
    return true;
  }

  // Check for visually distinct error styling
  if (hasErrorClass(element)) {
    return true;
  }

  return false;
}

/**
 * Check if error has proper description
 */
function hasProperErrorDescription(element: Element, device: any): boolean {
  // Check aria-describedby pointing to error message
  const ariaDescribedBy = element.attribute("aria-describedby");
  if (ariaDescribedBy.isSome()) {
    const describedByIds = ariaDescribedBy.get().split(/\s+/);
    const document = element.document();
    
    for (const id of describedByIds) {
      const describedElement = getElementDescendants(document, Node.fullTree).find(
        and(
          Element.hasId(id),
          Element.hasNamespace(Namespace.HTML),
        ),
      );
      
      if (describedElement.isSome()) {
        const text = describedElement.get().textContent().toLowerCase();
        const errorKeywords = ["error", "invalid", "required", "missing", "incorrect"];
        
        if (errorKeywords.some((keyword) => text.includes(keyword))) {
          return true;
        }
      }
    }
  }

  // Check for nearby error message
  if (hasNearbyErrorMessage(element)) {
    return true;
  }

  return false;
}

/**
 * Check if error has suggestion for correction
 */
function hasErrorSuggestion(element: Element, device: any): boolean {
  // Check aria-describedby for suggestion text
  const ariaDescribedBy = element.attribute("aria-describedby");
  if (ariaDescribedBy.isSome()) {
    const describedByIds = ariaDescribedBy.get().split(/\s+/);
    const document = element.document();
    
    for (const id of describedByIds) {
      const describedElement = getElementDescendants(document, Node.fullTree).find(
        and(
          Element.hasId(id),
          Element.hasNamespace(Namespace.HTML),
        ),
      );
      
      if (describedElement.isSome()) {
        const text = describedElement.get().textContent().toLowerCase();
        const suggestionKeywords = ["try", "use", "enter", "select", "choose", "format"];
        
        if (suggestionKeywords.some((keyword) => text.includes(keyword))) {
          return true;
        }
      }
    }
  }

  // Check for nearby suggestion text
  const nearbyElements = [
    ...element.precedingSiblings(Node.fullTree),
    ...element.followingSiblings(Node.fullTree),
  ];

  return nearbyElements.some((sibling) => {
    if (!Element.isElement(sibling)) {
      return false;
    }

    const text = sibling.textContent().toLowerCase();
    const suggestionKeywords = ["try", "use", "enter", "select", "choose", "format"];
    
    return suggestionKeywords.some((keyword) => text.includes(keyword));
  });
}

/**
 * @public
 */
export namespace Outcomes {
  export const HasErrorIdentification = Ok.of(
    Diagnostic.of(`The form control has proper error identification`),
  );

  export const HasNoErrorIdentification = Err.of(
    Diagnostic.of(`The form control does not have proper error identification`),
  );

  export const HasErrorDescription = Ok.of(
    Diagnostic.of(`The form control has proper error description`),
  );

  export const HasNoErrorDescription = Err.of(
    Diagnostic.of(`The form control does not have proper error description`),
  );

  export const HasErrorSuggestion = Ok.of(
    Diagnostic.of(`The form control has error correction suggestion`),
  );

  export const HasNoErrorSuggestion = Err.of(
    Diagnostic.of(`The form control does not have error correction suggestion`),
  );
}
