import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { isWhitespace } from "../common/predicate";
import { Scope } from "../tags";

const { hasAttribute, isDocumentElement } = Element;
const { isEmpty } = Iterable;
const { nor } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r4",
  requirements: [Criterion.of("3.1.1"), Technique.of("H57")],
  tags: [Scope.Page],
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

/**
 * @public
 */
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
