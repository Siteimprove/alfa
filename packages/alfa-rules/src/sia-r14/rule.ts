import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasDescendant } from "../common/predicate/has-descendant";
import { hasNameFrom } from "../common/predicate/has-name-from";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";
import { isVisible } from "../common/predicate/is-visible";

import { Question } from "../common/question";
import { hasCategory } from "../common/predicate/has-category";

const { filter, map, join } = Iterable;
const { and, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.githu.io/sanshikan/rules/sia-r14.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.HTML, Namespace.SVG)),
              and(
                hasRole(
                  and(
                    hasCategory(equals(Role.Category.Widget)),
                    hasNameFrom(equals("content"))
                  )
                ),
                and(
                  hasDescendant(
                    and(
                      Text.isText,
                      and(isVisible(device), not(isIgnored(device)))
                    ),
                    { flattened: true }
                  ),
                  hasAccessibleName(device)
                )
              )
            )
          )
        );
      },

      expectations(target) {
        const textContent = getVisibleTextContent(target, device);

        const accessibleNameIncludesTextContent = test(
          hasAccessibleName(device, accessibleName =>
            normalize(accessibleName).includes(textContent)
          ),
          target
        );

        return {
          1: accessibleNameIncludesTextContent
            ? Outcomes.VisibleIsInName
            : Question.of(
                "is-human-language",
                "boolean",
                target,
                "Does the accessible name of the element express anything in human language?"
              ).map(isHumanLanguage =>
                !isHumanLanguage
                  ? Outcomes.NameIsNotLanguage
                  : Outcomes.VisibleIsNotInName
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

function getVisibleTextContent(element: Element, device: Device): string {
  return normalize(
    join(
      map(
        filter(
          element.descendants({ flattened: true }),
          and(Text.isText, isVisible(device))
        ),
        text => text.data
      ),
      ""
    )
  );
}

export namespace Outcomes {
  export const VisibleIsInName = Some.of(
    Ok.of(
      "The visible text content of the element is included within its accessible name"
    ) as Result<string, string>
  );

  export const NameIsNotLanguage = Some.of(
    Ok.of(
      "The accessible name of the element does not express anything in human language"
    ) as Result<string, string>
  );

  export const VisibleIsNotInName = Some.of(
    Err.of(
      "The visible text content of the element is not included within its accessible name"
    ) as Result<string, string>
  );
}
