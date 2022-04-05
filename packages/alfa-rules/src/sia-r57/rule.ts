import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Text, Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { isTabbable, isWhitespace } from "../common/predicate";
import { Scope } from "../tags";

const { hasRole, isIgnored } = DOM;
const { isElement } = Element;
const { isEmpty } = Iterable;
const { and, not, nor, property } = Predicate;
const { isText } = Text;

export default Rule.Atomic.of<Page, Text>({
  uri: "https://alfa.siteimprove.com/rules/sia-r57",
  tags: [Scope.Page],
  evaluate({ document, device }) {
    const firstTabbable = document
      .tabOrder()
      .filter(isTabbable(device))
      .first();

    return {
      *applicability() {
        const descendants = document.descendants({
          flattened: true,
          nested: true,
        });

        if (
          descendants
            .filter(isElement)
            .some(hasRole(device, (role) => role.isLandmark()))
        ) {
          yield* descendants
            .filter(isText)
            .filter(
              and(
                property("data", nor(isEmpty, isWhitespace)),
                not(isIgnored(device))
              )
            );
        }
      },

      expectations(target) {
        return {
          1: expectation(
            Node.from(target, device)
              .ancestors()
              .some((ancestor) =>
                ancestor.role.some((role) => role.isLandmark())
              ),
            () => Outcomes.IsIncludedInLandmark,
            () =>
              expectation(
                firstTabbable.some((element) =>
                  element.isParentOf(target, {
                    flattened: true,
                  })
                ),
                () => Outcomes.IsIncludedInFirstFocusableElement,
                () => Outcomes.IsNotIncludedInLandmark
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsIncludedInLandmark = Ok.of(
    Diagnostic.of(`The text is included in a landmark region`)
  );

  export const IsIncludedInFirstFocusableElement = Ok.of(
    Diagnostic.of(`The text is included in the first focusable element`)
  );

  export const IsNotIncludedInLandmark = Err.of(
    Diagnostic.of(`The text is not included in a landmark region`)
  );
}
