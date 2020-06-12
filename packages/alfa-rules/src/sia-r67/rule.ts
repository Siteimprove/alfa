import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasAttribute } from "../common/predicate/has-attribute";
import { hasExplicitRole } from "../common/predicate/has-role";
import { hasValue } from "../common/predicate/has-value";
import equals = Predicate.equals;
import not = Predicate.not;

const { isElement, hasName, hasNamespace } = Element;
const { and, or } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r67.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(
            and(
              isElement,
              and(
                hasNamespace(Namespace.HTML, Namespace.SVG),
                isEmbeddedContent,
                not(hasName("iframe")),
                isMarkedAsDecorative
              )
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            hasAccessibleName(device)(target),
            () => Outcomes.HasName,
            () => Outcomes.HasNoName
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasNoName = Ok.of(
    Diagnostic.of(
      `The element is marked as decorative and does not have an accessible name`
    )
  );

  export const HasName = Err.of(
    Diagnostic.of(
      `The element is marked as decorative but has an accessible name`
    )
  );
}

/**
 * @see https://html.spec.whatwg.org/#embedded-content-category
 */
const isEmbeddedContent: Predicate<Element> = or(
  and(hasNamespace(Namespace.SVG), Element.hasName("svg")),
  and(hasNamespace(Namespace.MathML), Element.hasName("math")),
  and(
    hasNamespace(Namespace.HTML),
    Element.hasName(
      "audio",
      "canvas",
      "embed",
      "iframe",
      "img",
      "object",
      "picture",
      "video"
    )
  )
);

/**
 * Not fully matching the Sanshikan def as <a>Foo</a> (no href) is not flagged here.
 * Hence, this is OK for SIA R67 but will need more work if moved to a common helper.
 */
export const isMarkedAsDecorative: Predicate<Element> = or(
  hasExplicitRole("none", "presentation"),
  and(
    Element.hasName("img"),
    hasAttribute(and(Attribute.hasName("alt"), hasValue(equals(""))))
  )
);
