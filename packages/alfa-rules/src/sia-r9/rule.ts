import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r9.html",
  requirements: [
    Criterion.of("2.2.1"),
    Criterion.of("2.2.4"),
    Criterion.of("3.2.5"),
    Technique.of("G110"),
    Technique.of("H76"),
  ],
  evaluate({ document }) {
    // since we take the first one with a valid content attribute, we only need to store one value
    let refreshTime: number;

    return {
      applicability() {
        return document
          .descendants()
          .filter(isElement)
          .find(
            and(
              hasNamespace(Namespace.HTML),
              hasName("meta"),
              hasAttribute(
                "http-equiv",
                (value) => value.toLowerCase() === "refresh"
              ),
              hasAttribute("content", (value) =>
                getRefreshTime(value)
                  .map((time) => (refreshTime = time))
                  .isSome()
              )
            )
          )
          .map((meta) => [meta])
          .getOr([]);
      },

      expectations(target) {
        return {
          1: expectation(
            refreshTime === 0,
            () => Outcomes.HasImmediateRefresh,
            () =>
              expectation(
                refreshTime > 72000, // 20 hours = 20*60*60 seconds
                () => Outcomes.HasTwentyHoursDelayedRefresh,
                () => Outcomes.HasDelayedRefresh
              )
          ),
        };
      },
    };
  },
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
    Diagnostic.of(`The refresh or redirect happens immediately`)
  );

  export const HasTwentyHoursDelayedRefresh = Ok.of(
    Diagnostic.of(`The refresh or redirect happens after 20 hours`)
  );

  export const HasDelayedRefresh = Err.of(
    Diagnostic.of(`The refresh or redirect is delayed less than 20 hours`)
  );
}
