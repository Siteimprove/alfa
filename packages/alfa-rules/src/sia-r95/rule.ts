import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence/src/sequence";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { WithBadElements } from "../common/diagnostic/with-bad-elements";

import { Scope, Version } from "../tags";

const { isElement, hasName, hasNamespace, hasTabIndex } = Element;
const { and, test } = Predicate;
const { isTabbable, isVisible } = Style;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r95",
  requirements: [Criterion.of("2.1.1")],
  tags: [Scope.Component, Version.of(2)],
  evaluate({ device, document }) {
    let tabbables = Map.empty<Element, Sequence<Element>>();

    return {
      applicability() {
        return document
          .descendants(Node.fullTree)
          .filter(isElement)
          .filter(and(hasNamespace(Namespace.HTML), hasName("iframe")))
          .filter((iframe) =>
            iframe.content
              .map((contentDocument) =>
                contentDocument
                  .descendants(Node.flatTree)
                  .filter(isElement)
                  .filter(and(isVisible(device), isTabbable(device)))
              )
              .some((sequence) => {
                tabbables = tabbables.set(iframe, sequence);
                return !sequence.isEmpty();
              })
          );
      },

      expectations(target) {
        return {
          1: expectation(
            test(
              hasTabIndex((tabindex) => tabindex >= 0),
              target
            ),
            () =>
              Outcomes.IsTabbable(
                tabbables.get(target).getOr(Sequence.empty<Element>())
              ),
            () =>
              Outcomes.IsNotTabbable(
                tabbables.get(target).getOr(Sequence.empty<Element>())
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsTabbable = (tabbables: Iterable<Element>) =>
    Ok.of(WithBadElements.of(`The iframe has no negative tabindex`, tabbables));

  export const IsNotTabbable = (tabbables: Iterable<Element>) =>
    Err.of(WithBadElements.of(`The iframe has a negative tabindex`, tabbables));
}
