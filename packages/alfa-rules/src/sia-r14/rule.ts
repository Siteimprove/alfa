import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasAttribute } from "../common/predicate/has-attribute";
import { hasDescendant } from "../common/predicate/has-descendant";
import { hasRole } from "../common/predicate/has-role";
import { isFocusable } from "../common/predicate/is-focusable";
import { isPerceivable } from "../common/predicate/is-perceivable";

const { isElement, hasNamespace } = Element;
const { isText } = Text;
const { and, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.githu.io/sanshikan/rules/sia-r14.html",
  requirements: [Criterion.of("2.5.3"), Technique.of("G208")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasAttribute(
                (attribute) =>
                  attribute.name === "aria-label" ||
                  attribute.name === "aria-labelledby"
              ),
              isFocusable(device),
              hasRole((role) => role.isWidget() && role.isNamedBy("contents")),
              hasDescendant(and(Text.isText, isPerceivable(device)), {
                flattened: true,
              })
            )
          );
      },

      expectations(target) {
        const textContent = getPerceivableTextContent(target, device);

        const accessibleNameIncludesTextContent = test(
          hasAccessibleName(device, (accessibleName) =>
            normalize(accessibleName.value).includes(textContent)
          ),
          target
        );

        return {
          1: expectation(
            accessibleNameIncludesTextContent,
            () => Outcomes.VisibleIsInName,
            () => Outcomes.VisibleIsNotInName
          ),
        };
      },
    };
  },
});

function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function getPerceivableTextContent(element: Element, device: Device): string {
  return normalize(
    element
      .descendants({ flattened: true })
      .filter(isText)
      .filter(isPerceivable(device))
      .map((text) => text.data)
      .join("")
  );
}

export namespace Outcomes {
  export const VisibleIsInName = Ok.of(
    Diagnostic.of(
      `The visible text content of the element is included within its accessible name`
    )
  );

  export const VisibleIsNotInName = Err.of(
    Diagnostic.of(
      `The visible text content of the element is not included within its accessible name`
    )
  );
}
