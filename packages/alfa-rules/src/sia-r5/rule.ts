import { Rule } from "@siteimprove/alfa-act";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import {expectation} from "../common/expectations/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isWhitespace } from "../common/predicate/is-whitespace";

const { filter, map, isEmpty } = Iterable;
const { and, nor } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r5.html",
  evaluate({ document }) {
    return {
      applicability() {
        return map(
          filter(
            document.children(),
            and(
              Element.isElement,
              and(
                isDocumentElement(),
                hasAttribute("lang", nor(isEmpty, isWhitespace))
              )
            )
          ),
          element => element.attribute("lang").get()
        );
      },

      expectations(target) {
        return {
          1: expectation(Language.from(target.value).isSome(),
            Outcomes.HasValidLanguage,
            Outcomes.HasNoValidLanguage)
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasValidLanguage =
    Ok.of("The lang attribute has a valid primary language tag"
  );
  export const HasNoValidLanguage =
    Err.of(
      "The lang attribute does not have a valid primary language tag"
  );
}
