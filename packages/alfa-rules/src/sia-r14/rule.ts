import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasCategory } from "../common/predicate/has-category";
import { hasDescendant } from "../common/predicate/has-descendant";
import { hasNameFrom } from "../common/predicate/has-name-from";
import { hasRole } from "../common/predicate/has-role";
import { isPerceivable } from "../common/predicate/is-perceivable";
import { isVisible } from "../common/predicate/is-visible";

import { Question } from "../common/question";

const { isElement, hasNamespace } = Element;
const { and, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.githu.io/sanshikan/rules/sia-r14.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document.descendants({ flattened: true, nested: true }).filter(
          and(
            isElement,
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasRole(
                and(
                  hasCategory(equals(Role.Category.Widget)),
                  hasNameFrom(equals("content"))
                )
              ),
              hasDescendant(and(Text.isText, isPerceivable(device)), {
                flattened: true,
              }),
              hasAccessibleName(device)
            )
          )
        );
      },

      expectations(target) {
        const textContent = getVisibleTextContent(target, device);

        const accessibleNameIncludesTextContent = test(
          hasAccessibleName(device, (accessibleName) =>
            normalize(accessibleName).includes(textContent)
          ),
          target
        );

        return {
          1: expectation(
            accessibleNameIncludesTextContent,
            () => Outcomes.VisibleIsInName,
            () =>
              Question.of(
                "is-human-language",
                "boolean",
                target,
                "Does the accessible name of the element express anything in human language?"
              ).map((isHumanLanguage) =>
                expectation(
                  !isHumanLanguage,
                  () => Outcomes.NameIsNotLanguage,
                  () => Outcomes.VisibleIsNotInName
                )
              )
          ),
        };
      },
    };
  },
});

function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function getVisibleTextContent(element: Element, device: Device): string {
  return normalize(
    element
      .descendants({ flattened: true })
      .filter(and(Text.isText, isVisible(device)))
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

  export const NameIsNotLanguage = Ok.of(
    Diagnostic.of(
      `The accessible name of the element does not express anything in human language`
    )
  );

  export const VisibleIsNotInName = Err.of(
    Diagnostic.of(
      `The visible text content of the element is not included within its accessible name`
    )
  );
}
