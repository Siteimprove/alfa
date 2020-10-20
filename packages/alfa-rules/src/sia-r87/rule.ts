import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Document } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasChild } from "../common/predicate/has-child";
import { hasRole } from "../common/predicate/has-role";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isTabbable } from "../common/predicate/is-tabbable";
import { isIgnored } from "../common/predicate/is-ignored";
import { isKeyboardActionable } from "../common/predicate/is-keyboard-actionable";

const { not, fold } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r87.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return fold(
          hasChild(isDocumentElement),
          () => [document],
          () => [],
          document
        );
      },

      expectations(target) {
        const firstTabbable = target.tabOrder().find(isTabbable(device));

        return {
          1: expectation(
            firstTabbable.isSome(),
            () => Outcomes.HasTabbable,
            () => Outcomes.HasNoTabbable
          ),

          2: expectation(
            firstTabbable.isSome(),
            () =>
              expectation(
                firstTabbable.some(hasRole((role) => role.is("link"))),
                () =>
                  expectation(
                    firstTabbable.some(not(isIgnored(device))),
                    () =>
                      expectation(
                        firstTabbable.some(isKeyboardActionable(device)),
                        () => Outcomes.FirstTabbableIsLinkToContent,
                        () => Outcomes.FirstTabbableIsNotKeyboardActionable
                      ),
                    () => Outcomes.FirstTabbableIsIgnored
                  ),
                () => Outcomes.FirstTabbableIsNotLink
              ),
            () => Outcomes.HasNoTabbable
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasTabbable = Ok.of(
    Diagnostic.of(`The document has at least one tabbable descendant`)
  );

  export const HasNoTabbable = Err.of(
    Diagnostic.of(`The document has no tabbable descendants`)
  );

  export const FirstTabbableIsNotLink = Err.of(
    Diagnostic.of(`The first tabbable element in the document is not a link`)
  );

  export const FirstTabbableIsIgnored = Err.of(
    Diagnostic.of(
      `The first tabbable element in the document is not included in the
      accessibility tree`
    )
  );

  export const FirstTabbableIsNotKeyboardActionable = Err.of(
    Diagnostic.of(
      `The first tabbable element in the document is not keyboard actionable`
    )
  );

  export const FirstTabbableIsLinkToContent = Ok.of(
    Diagnostic.of(
      `The first tabbable element in the document is a keyboard actionable link
      that is included in the accessibility tree and links to the main block of
      content of the document`
    )
  );
}
