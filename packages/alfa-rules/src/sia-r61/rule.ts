import { Rule } from "@siteimprove/alfa-act";
import * as Accessible from "@siteimprove/alfa-aria";
import { Document, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectation";
import { hasChild } from "../common/predicate/has-child";
import { hasName } from "../common/predicate/has-name";
import { hasRole } from "../common/predicate/has-role";
import { isDocumentElement } from "../common/predicate/is-document-element";
import equals = Predicate.equals;

const { and } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r61.html",
  evaluate({ device, document }) {
    let firstHeading: Element;

    return {
      applicability() {
        if (hasChild(and(Element.isElement, isDocumentElement()))(document)) {
          const myFirstHeading = document
            .descendants({ flattened: true })
            .filter(and(Element.isElement, hasRole(hasName(equals("heading")))))
            .first();
          if (myFirstHeading.isSome()) {
            firstHeading = myFirstHeading.get();
            return [document];
          }
        }
        return [];
      },

      expectations(target) {
        const accessibleHeading = Accessible.Node.from(firstHeading, device);

        return {
          1: expectation(
            accessibleHeading.some((accNode) =>
              accNode
                .attribute("aria-level")
                .map((attribute) => attribute === "1")
                .getOr(false)
            ),
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
