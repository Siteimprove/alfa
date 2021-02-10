import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isWhitespace } from "../common/predicate/is-whitespace";

const { isEmpty } = Iterable;
const { nor } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r4.html",
  requirements: [Criterion.of("3.1.1"), Technique.of("H57")],
  evaluate({ document }) {
    return {
      applicability() {
        return document.children().filter(isDocumentElement);
      },

      expectations(target) {
        return {
          1: expectation(
            hasAttribute("lang", nor(isEmpty, isWhitespace))(target),
            () => Outcomes.HasLanguage,
            () => Outcomes.HasNoLanguage
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasLanguage = Ok.of(
    Diagnostic.of(
      `The \`lang\` attribute exists and is neither empty nor only whitespace`
    )
  );

  export const HasNoLanguage = Err.of(
    Diagnostic.of(
      `The \`lang\` attribute is either missing, empty, or only whitespace`
    )
  );
}
