import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import type { Document } from "@siteimprove/alfa-dom";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import type { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/index.js";
import { WithBadElements } from "../common/diagnostic/with-bad-elements.js";

import { withDocumentElement } from "../common/applicability/with-document-element.js";
import { BestPractice } from "../requirements/index.js";
import { Scope, Stability } from "../tags/index.js";

const { hasName, hasNamespace } = Element;
const { and } = Predicate;
const { isRendered } = Style;
const { getElementDescendants } = Query;

const isDeprecated = hasName(
  "acronym",
  "applet",
  "basefont",
  "bgsound",
  "big",
  "blink",
  "center",
  "content",
  "dir",
  "font",
  "frame",
  "frameset",
  "image",
  "keygen",
  "marquee",
  "menuitem",
  "nobr",
  "noembed",
  "noframes",
  "plaintext",
  "rb",
  "rtc",
  "shadow",
  "spacer",
  "strike",
  "tt",
  "xmp",
);

export default Rule.Atomic.of<Page, Document>({
  uri: "https://alfa.siteimprove.com/rules/sia-r70",
  requirements: [BestPractice.of("no-deprecated-elements")],
  tags: [Scope.Page, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return withDocumentElement(document);
      },

      expectations(target) {
        const deprecatedElements = getElementDescendants(
          target,
          Node.fullTree,
        ).filter(
          and(hasNamespace(Namespace.HTML), isDeprecated, isRendered(device)),
        );

        return {
          1: expectation(
            deprecatedElements.isEmpty(),
            () => Outcomes.HasNoDeprecatedElement,
            () => Outcomes.HasDeprecatedElements(deprecatedElements),
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
  export const HasNoDeprecatedElement = Ok.of(
    Diagnostic.of(`The document doesn't contain any deprecated elements`),
  );

  export const HasDeprecatedElements = (errors: Iterable<Element>) =>
    Err.of(
      WithBadElements.of(`The document contains deprecated elements`, errors),
    );
}
