import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasAttribute, isDocumentElement } = Element;
const { isEmpty } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r6",
  requirements: [Criterion.of("3.1.1")],
  tags: [Scope.Page],
  evaluate({ document }) {
    return {
      applicability() {
        return document
          .children()
          .filter(isDocumentElement)
          .filter(
            and(
              hasAttribute("lang", (value) => Language.parse(value).isOk()),
              hasAttribute("xml:lang", not(isEmpty))
            )
          );
      },

      expectations(target) {
        // The last filter in applicability ensures that lang exists
        // The applicability ensures it can be parsed
        const lang = Language.parse(
          target.attribute("lang").getUnsafe().value
        ).getUnsafe();
        // The last filter in applicability ensures that xml:lang exists
        const xmlLang = Language.parse(
          target.attribute("xml:lang").getUnsafe().value
        );

        return {
          1: expectation(
            xmlLang.every((xmlLang) => xmlLang.primary.equals(lang.primary)),
            () => Outcomes.HasMatchingLanguages,
            () => Outcomes.HasNonMatchingLanguages
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
  export const HasMatchingLanguages = Ok.of(
    Diagnostic.of(
      `The \`lang\` and \`xml:lang\` attributes have matching primary language subtags`
    )
  );

  export const HasNonMatchingLanguages = Err.of(
    Diagnostic.of(
      `The \`lang\` and \`xml:lang\` attributes do not have matching primary language subtags`
    )
  );
}
