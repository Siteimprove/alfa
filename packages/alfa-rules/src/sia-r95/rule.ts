import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node, Query } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { WithBadElements } from "../common/diagnostic/with-bad-elements";

import { Scope, Stability, Version } from "../tags";

const { hasName, hasNamespace, hasTabIndex } = Element;
const { and, test } = Predicate;
const { isTabbable, isVisible } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r95",
  requirements: [
    Criterion.of("2.1.1"),
    // The 2.1.3 secondary mapping is missing in ACT rules
    // https://github.com/act-rules/act-rules.github.io/issues/2026
    // Commenting it out as it would otherwise invalidate our implementation
    // in the reports.
    // Criterion.of("2.1.3"),
  ],
  tags: [Scope.Component, Stability.Stable, Version.of(2)],
  evaluate({ device, document }) {
    let tabbables = Map.empty<Element, Sequence<Element>>();

    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree)
          .filter(and(hasNamespace(Namespace.HTML), hasName("iframe")))
          .filter((iframe) =>
            iframe.content
              .map((contentDocument) =>
                getElementDescendants(contentDocument, Node.flatTree).filter(
                  and(isVisible(device), isTabbable(device)),
                ),
              )
              .some((sequence) => {
                tabbables = tabbables.set(iframe, sequence);
                return !sequence.isEmpty();
              }),
          );
      },

      expectations(target) {
        return {
          1: expectation(
            test(
              hasTabIndex((tabindex) => tabindex >= 0),
              target,
            ),
            () =>
              Outcomes.IsTabbable(
                tabbables.get(target).getOr(Sequence.empty<Element>()),
              ),
            () =>
              Outcomes.IsNotTabbable(
                tabbables.get(target).getOr(Sequence.empty<Element>()),
              ),
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
  export const IsTabbable = (tabbables: Iterable<Element>) =>
    Ok.of(WithBadElements.of(`The iframe has no negative tabindex`, tabbables));

  export const IsNotTabbable = (tabbables: Iterable<Element>) =>
    Err.of(WithBadElements.of(`The iframe has a negative tabindex`, tabbables));
}
