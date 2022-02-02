import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { getRefreshTime } from "../common/expectation/get-refresh-time";

import { hasAttribute } from "../common/predicate";

import { RefreshDelay as Outcomes } from "../common/outcome/refresh-delay";
import { Scope } from "../tags";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r96",
  requirements: [
    Criterion.of("2.2.4"),
    Criterion.of("3.2.5"),
    Technique.of("G110"),
    Technique.of("H76"),
  ],
  tags: [Scope.Page],
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
            () => Outcomes.HasDelayedRefresh
          ),
        };
      },
    };
  },
});
