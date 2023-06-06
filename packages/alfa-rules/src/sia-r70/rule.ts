import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import {
  Document,
  Element,
  Namespace,
  Node,
  Query,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { WithBadElements } from "../common/diagnostic/with-bad-elements";

import { withDocumentElement } from "../common/applicability/with-document-element";
import { Scope } from "../tags";

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
  "hgroup",
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
  "xmp"
);

export default Rule.Atomic.of<Page, Document>({
  uri: "https://alfa.siteimprove.com/rules/sia-r70",
  tags: [Scope.Page],
  evaluate({ device, document }) {
    return {
      applicability() {
        return withDocumentElement(document);
      },

      expectations(target) {
        const deprecatedElements = getElementDescendants(
          target,
          Node.fullTree
        ).filter(
          and(hasNamespace(Namespace.HTML), isDeprecated, isRendered(device))
        );

        return {
          1: expectation(
            deprecatedElements.isEmpty(),
            () => Outcomes.HasNoDeprecatedElement,
            () => Outcomes.HasDeprecatedElements(deprecatedElements)
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
    Diagnostic.of(`The document doesn't contain any deprecated elements`)
  );

  export const HasDeprecatedElements = (errors: Iterable<Element>) =>
    Err.of(
      WithBadElements.of(`The document contains deprecated elements`, errors)
    );
}
