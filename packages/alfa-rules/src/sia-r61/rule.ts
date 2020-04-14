import { Rule } from "@siteimprove/alfa-act";
import { Document, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { getAriaLevel } from "../common/expectation/get-aria-level";
import { hasChild } from "../common/predicate/has-child";
import { hasName } from "../common/predicate/has-name";
import { hasRole } from "../common/predicate/has-role";
import { isDocumentElement } from "../common/predicate/is-document-element";

const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r61.html",
  evaluate({ device, document }) {
    const firstHeading = document
      .descendants({ flattened: true })
      .find(and(Element.isElement, hasRole(hasName(equals("heading")))));

    return {
      applicability() {
        if (hasChild(and(Element.isElement, isDocumentElement()))(document)) {
          if (firstHeading.isSome()) {
            return [document];
          }
        }
        return [];
      },

      expectations(target) {
        return {
          1: expectation(
            getAriaLevel(firstHeading.get(), device).every((level) => level === 1),
            () => Outcomes.StartWithLevel1Heading,
            () => Outcomes.StartWithHigherLevelHeading
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const StartWithLevel1Heading = Ok.of(
    "The document starts with a level 1 heading"
  );

  export const StartWithHigherLevelHeading = Err.of(
    "The document starts with a level 2 or more heading"
  );
}
