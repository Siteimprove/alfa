import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasName } from "../common/predicate/has-name";
import { hasNamespace } from "../common/predicate/has-namespace";

const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r9.html",
  evaluate({ document }) {
    return {
      applicability() {
        return document
          .descendants()
          .filter(
            and(
              Element.isElement,
              and(
                hasNamespace(equals(Namespace.HTML)),
                and(
                  hasName(equals("meta")),
                  and(
                    hasAttribute(
                      "http-equiv",
                      value => value.toLowerCase() === "refresh"
                    ),
                    hasAttribute("content", value =>
                      getRefreshTime(value).isSome()
                    )
                  )
                )
              )
            )
          )
          .first()
          .map(meta => [meta])
          .getOr([]);
      },

      expectations(target) {
        const refreshTime = getRefreshTime(
          target.attribute("content").get().value
        ).get();

        return {
          1: expectation(
            refreshTime === 0 || refreshTime! > 72000,
            Outcomes.HasImmediateRefresh,
            Outcomes.HasDelayedRefresh
          )
        };
      }
    };
  }
});

const whitespace = /\s/;
const digit = /\d/;

/**
 * @see https://html.spec.whatwg.org/#attr-meta-http-equiv-refresh
 */
function getRefreshTime(content: string): Option<number> {
  if (content.length === 0) {
    return None;
  }

  let i = 0;

  while (whitespace.test(content[i])) {
    i++;
  }

  const start = i;

  while (digit.test(content[i])) {
    i++;
  }

  if (start === i) {
    return None;
  }

  const next = content[i];

  // As long as the time of the refresh is ended correctly, the URL won't matter
  // in terms of the validity of the refresh. If the URL is therefore invalid,
  // the refresh will simply redirect to the current page.
  if (next !== undefined && next !== ";" && next !== ",") {
    return None;
  }

  return Option.of(parseInt(content.substring(start, i), 10));
}

export namespace Outcomes {
  export const HasImmediateRefresh = Ok.of(
    "The refresh or redirect happens immediately or after 20 hours"
  );

  export const HasDelayedRefresh = Err.of(
    "The refresh or redirect is delayed less than 20 hours"
  );
}
