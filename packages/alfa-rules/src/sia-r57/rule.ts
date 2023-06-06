import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Element, Query, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation";

import { isWhitespace } from "../common/predicate";
import { Scope } from "../tags";

const {
  hasIncorrectRoleWithoutName,
  hasRole,
  isIncludedInTheAccessibilityTree,
} = DOM;
const { isElement } = Element;
const { isEmpty } = Iterable;
const { nor, not, or, property, test } = Predicate;
const { and } = Refinement;
const { isTabbable } = Style;
const { isText } = Text;
const { getElementDescendants } = Query;

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
        if (
          getElementDescendants(document, dom.Node.fullTree).some(
            and(
              hasRole(device, (role) => role.isLandmark()),
              // Circumventing https://github.com/Siteimprove/alfa/issues/298
              not(hasIncorrectRoleWithoutName(device))
            )
          )
        ) {
          yield* document
            .descendants(dom.Node.fullTree)
            .filter(isText)
            .filter(
              and(
                property("data", nor(isEmpty, isWhitespace)),
                isIncludedInTheAccessibilityTree(device)
              )
            );
        }
      },

      expectations(target) {
        // First ancestor in the accessibility tree which is dialog or landmark
        const role = Node.from(target, device)
          .ancestors()
          .find(
            or(
              // landmark
              and(
                (ancestor) => ancestor.role.some((role) => role.isLandmark()),
                // Circumventing https://github.com/Siteimprove/alfa/issues/298
                // by discarding the "landmark" ancestor if the role is incorrect
                (ancestor) =>
                  test(
                    and(isElement, not(hasIncorrectRoleWithoutName(device))),
                    ancestor.node
                  )
              ),
              // dialog
              (ancestor) => ancestor.role.some((role) => role.is("dialog"))
            )
          )
          .flatMap((ancestor) => ancestor.role);

        return {
          1: expectation(
            role.some((role) => role.isLandmark()),
            () => Outcomes.IsIncludedInLandmark,
            () =>
              expectation(
                role.some((role) => role.is("dialog")),
                () => Outcomes.IsIncludedInDialog,
                () =>
                  expectation(
                    firstTabbable.some((element) =>
                      element.isInclusiveAncestorOf(target, dom.Node.flatTree)
                    ),
                    () => Outcomes.IsIncludedInFirstFocusableElement,
                    () => Outcomes.IsNotIncludedInLandmark
                  )
              )
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const IsIncludedInLandmark = Ok.of(
    Diagnostic.of(`The text is included in a landmark region`)
  );

  export const IsIncludedInDialog = Ok.of(
    Diagnostic.of(`The text is included in a dialog`)
  );

  export const IsIncludedInFirstFocusableElement = Ok.of(
    Diagnostic.of(`The text is included in the first focusable element`)
  );

  export const IsNotIncludedInLandmark = Err.of(
    Diagnostic.of(`The text is not included in a landmark region`)
  );
}
