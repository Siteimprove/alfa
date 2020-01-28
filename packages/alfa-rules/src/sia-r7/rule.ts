import { Rule } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { isWhitespace } from "../common/predicate/is-whitespace";

const { filter, first, map, isEmpty } = Iterable;
const { and, nor, equals } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r7.html",
  evaluate({ document }) {
    return {
      applicability() {
        return first(
          filter(
            document.descendants(),
            and(
              Element.isElement,
              and(hasNamespace(equals(Namespace.HTML)), hasName(equals("body")))
            )
          )
        )
          .map(body =>
            map(
              filter(
                body.descendants(),
                and(
                  Element.isElement,
                  hasAttribute("lang", nor(isEmpty, isWhitespace))
                )
              ),
              element => element.attribute("lang").get()
            )
          )
          .getOr([]);
      },

      expectations(target) {
        return {
          1: Language.from(target.value).isSome()
            ? Some.of(
                Ok.of(
                  "The lang attribute has a valid primary language subtag"
                ) as Result<string, string>
              )
            : Some.of(
                Err.of(
                  "The lang attribute does not have a valid primary language subtag"
                ) as Result<string, string>
              )
        };
      }
    };
  }
});
