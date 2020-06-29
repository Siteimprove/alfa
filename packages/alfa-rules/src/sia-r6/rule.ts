import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isDocumentElement } from "../common/predicate/is-document-element";

const { isEmpty } = Iterable;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove/github.io/sanshikan/rules/sia-r6.html",
  evaluate({ document }) {
    return {
      applicability() {
        return document.children().filter(
          and(
            isDocumentElement,
            and(
              hasAttribute("lang", (value) => Language.parse(value).isSome()),
              hasAttribute("xml:lang", not(isEmpty))
            )
          )
        );
      },

      expectations(target) {
        const lang = Language.parse(target.attribute("lang").get().value).get();
        const xmlLang = Language.parse(
          target.attribute("xml:lang").get().value
        );

        return {
          1: expectation(
            xmlLang.isNone() ||
              xmlLang
                .filter((xmlLang) => xmlLang.primary === lang.primary)
                .isSome(),
            () => Outcomes.HasMatchingLanguages,
            () => Outcomes.HasNonMatchingLanguages
          ),
        };
      },
    };
  },
});

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
