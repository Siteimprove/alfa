import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { getRefreshTime } from "../common/expectation/get-refresh-time.js";

import { RefreshDelay as Outcomes } from "../common/outcome/refresh-delay.js";
import { Scope, Stability } from "../tags/index.js";

const { hasAttribute, hasName, hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r96",
  requirements: [
    Criterion.of("2.2.4"),
    Criterion.of("3.2.5"),
    Technique.of("G110"),
    Technique.of("H76"),
  ],
  tags: [Scope.Page, Stability.Stable],
  evaluate({ document }) {
    // since we take the first one with a valid content attribute, we only need to store one value
    let refreshTime: number;

    return {
      applicability() {
        return getElementDescendants(document)
          .find(
            and(
              hasNamespace(Namespace.HTML),
              hasName("meta"),
              hasAttribute(
                "http-equiv",
                (value) => value.toLowerCase() === "refresh",
              ),
              hasAttribute("content", (value) =>
                getRefreshTime(value)
                  .map((time) => (refreshTime = time))
                  .isSome(),
              ),
            ),
          )
          .map((meta) => [meta])
          .getOr([]);
      },

      expectations(target) {
        return {
          1: expectation(
            refreshTime === 0,
            () => Outcomes.HasImmediateRefresh,
            () => Outcomes.HasDelayedRefresh,
          ),
        };
      },
    };
  },
});
