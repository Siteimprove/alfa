import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import {
  Element,
  isElement,
  isText,
  Namespace,
  Node
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasDescendant } from "../common/predicate/has-descendant";
import { hasNameFrom } from "../common/predicate/has-name-from";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isExposed } from "../common/predicate/is-exposed";
import { isVisible } from "../common/predicate/is-visible";

import { Question } from "../common/question";
import { walk } from "../common/walk";

const { filter, map, join } = Iterable;
const { and, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.githu.io/sanshikan/rules/sia-r14.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          walk(document, document, { flattened: true, nested: true }),
          and(
            isElement,
            and(
              hasNamespace(document, equals(Namespace.HTML, Namespace.SVG)),
              and(
                hasRole(
                  document,
                  role => role.category === Role.Category.Widget
                ),
                and(
                  hasRole(document, hasNameFrom(equals("content"))),
                  and(
                    hasDescendant(
                      document,
                      and(
                        isText,
                        and(
                          isVisible(document, device),
                          isExposed(document, device)
                        )
                      ),
                      { flattened: true }
                    ),
                    hasAccessibleName(document, device)
                  )
                )
              )
            )
          )
        );
      },

      expectations(target) {
        const textContent = getVisibleTextContent(target, document, device);

        const accessibleNameIncludesTextContent = test(
          hasAccessibleName(document, device, accessibleName =>
            normalize(accessibleName).includes(textContent)
          ),
          target
        );

        return {
          1: accessibleNameIncludesTextContent
            ? Ok.of(
                "The visible text content of the element is included within its accessible name"
              )
            : Question.of(
                "is-human-language",
                "boolean",
                target,
                "Does the accessible name of the element express anything in human language?"
              ).map(isHumanLanguage =>
                !isHumanLanguage
                  ? Ok.of(
                      "The accessible name of the element does not express anything in human language"
                    )
                  : Err.of(
                      "The visible text content of the element is not included within its accessible name"
                    )
              )
        };
      }
    };
  }
});

function normalize(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getVisibleTextContent(
  node: Element | Text,
  context: Node,
  device: Device
): string {
  return normalize(
    join(
      map(
        filter(
          walk(node, context, { flattened: true }),
          and(isText, isVisible(context, device))
        ),
        text => text.data
      ),
      ""
    )
  );
}
