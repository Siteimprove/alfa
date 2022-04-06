import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { isWhitespace } from "../common/predicate";
import { Scope } from "../tags";

const { isDocumentElement } = Element;
const { isEmpty } = Iterable;
const { nor } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r5",
  requirements: [Criterion.of("3.1.1"), Technique.of("H57")],
  tags: [Scope.Page],
  evaluate({ document }) {
    return {
      applicability() {
        return document
          .children()
          .filter(isDocumentElement)
          .filter(Element.hasAttribute("lang", nor(isEmpty, isWhitespace)))
          .map((element) => element.attribute("lang").get());
      },

      expectations(target) {
        return {
          1: expectation(
            Language.parse(target.value).isOk(),
            () => Outcomes.HasValidLanguage,
            () => Outcomes.HasNoValidLanguage
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasValidLanguage = Ok.of(
    Diagnostic.of(`The \`lang\` attribute has a valid primary language tag`)
  );
  export const HasNoValidLanguage = Err.of(
    Diagnostic.of(
      `The \`lang\` attribute does not have a valid primary language tag`
    )
  );
}
