import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { String } from "@siteimprove/alfa-string";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasAttribute, isDocumentElement } = Element;
const { not } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r5",
  requirements: [Criterion.of("3.1.1"), Technique.of("H57")],
  tags: [Scope.Page, Stability.Stable],
  evaluate({ document }) {
    return {
      applicability() {
        return (
          document
            .children()
            .filter(isDocumentElement)
            .filter(hasAttribute("lang", not(String.isWhitespace)))
            // The previous filter ensures that lang exists
            .map((element) => element.attribute("lang").getUnsafe())
        );
      },

      expectations(target) {
        return {
          1: expectation(
            Language.parse(target.value).isOk(),
            () => Outcomes.HasValidLanguage,
            () => Outcomes.HasNoValidLanguage,
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
  export const HasValidLanguage = Ok.of(
    Diagnostic.of(`The \`lang\` attribute has a valid primary language tag`),
  );
  export const HasNoValidLanguage = Err.of(
    Diagnostic.of(
      `The \`lang\` attribute does not have a valid primary language tag`,
    ),
  );
}
