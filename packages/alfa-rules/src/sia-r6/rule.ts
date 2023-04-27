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
const { and, not, tee, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r6",
  requirements: [Criterion.of("3.1.1")],
  tags: [Scope.Page],
  evaluate({ document }) {
    // These will be set at most once since the rule only applies to the document element
    let cachedLang: Language;
    let cachedXmlLang: string;

    return {
      applicability() {
        return document
          .children()
          .filter(isDocumentElement)
          .filter((element) =>
            test(
              and(
                hasAttribute("lang", (value) =>
                  Language.parse(value)
                    .tee((lang) => {
                      cachedLang = lang;
                    })
                    .isOk()
                ),
                hasAttribute(
                  "xml:lang",
                  tee(not(isEmpty), (xmlLang: string) => {
                    cachedXmlLang = xmlLang;
                  })
                )
              ),
              element
            )
          );
      },

      expectations(target) {
        // `cachedLang` and `cachedXmlLang` are set by the applicability
        return {
          1: expectation(
            Language.parse(cachedXmlLang).every((xmlLang) =>
              xmlLang.primary.equals(cachedLang.primary)
            ),
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
