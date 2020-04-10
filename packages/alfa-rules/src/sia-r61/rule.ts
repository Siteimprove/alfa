import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
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

const { and, fold } = Predicate;

export default Rule.Atomic.of<Page, Document>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r61.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return fold(
          hasChild(and(Element.isElement, isDocumentElement())),
          document,
          () => [document],
          () => []
        );
      },

      expectations(target) {
        const firstHeading = target
          .descendants({ flattened: true })
          .filter(and(Element.isElement, hasRole(hasName(equals("heading")))))
          .first();

        return {
          1: expectation(
            firstHeading.isNone(),
            () => Outcomes.HasNoHeadings,
            () =>
              expectation(
                firstHeading
                  .get()
                  .attribute("aria-level")
                  .map((attribute) => attribute.value === "1")
                  .getOr(false),
                () => Outcomes.StartWithLevel1Heading,
                () => Outcomes.StartWithHigherLevelHeading
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasNoHeadings = Ok.of("The document has no headings");

  export const StartWithLevel1Heading = Ok.of(
    "The document starts with a level 1 heading"
  );

  export const StartWithHigherLevelHeading = Err.of(
    "The document starts with a level 2 or more heading"
  );
}
