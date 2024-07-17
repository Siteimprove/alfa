import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { String } from "@siteimprove/alfa-string";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasAttribute, isDocumentElement } = Element;
const { not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r4",
  requirements: [Criterion.of("3.1.1"), Technique.of("H57")],
  tags: [Scope.Page, Stability.Stable],
  evaluate({ document }) {
    return {
      applicability() {
        return document.children().filter(isDocumentElement);
      },

      expectations(target) {
        return {
          1: expectation(
            hasAttribute("lang", not(String.isWhitespace))(target),
            () => Outcomes.HasLanguage,
            () => Outcomes.HasNoLanguage,
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
      `The \`lang\` attribute exists and is neither empty nor only whitespace`,
    ),
  );

  export const HasNoLanguage = Err.of(
    Diagnostic.of(
      `The \`lang\` attribute is either missing, empty, or only whitespace`,
    ),
  );
}
