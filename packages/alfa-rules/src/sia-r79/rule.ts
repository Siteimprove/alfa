import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

import { isRendered, isVisible } from "../common/predicate";
import { Predicate } from "@siteimprove/alfa-predicate";

const { hasName, isElement } = Element;
const { isText } = Text;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r80",
  requirements: [Criterion.of("1.4.8")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document

          .descendants({
            flattened: true,
            nested: true,
          })
          .filter(isElement)
          .filter(and(hasName("pre"), isRendered(device)));
      },

      expectations(target) {
        return {
          1: expectation(
            isVisible(device)(target),
            () => Outcomes.IsOk,
            () =>
              expectation(
                target
                  .inclusiveAncestors({
                    flattened: true,
                    nested: true,
                  })
                  .filter(isElement)
                  .some((element) =>
                    aria.Node.from(element, device)
                      .attribute("aria-hidden")
                      .some((attribute) => attribute.value === "true")
                  ),
                () => Outcomes.IsOk,
                () => Outcomes.IsNotOk
              )
          ),
          2: expectation(
            target
              .ancestors({
                flattened: true,
                nested: true,
              })
              .filter(isElement)
              .some(hasName("figure")) || isGood(device)(target),
            () => Outcomes.IsOk,
            () => Outcomes.IsNotOk
          ),
        };
      },
    };
  },
});

function isGood(device: Device): Predicate<Node> {
  return function isGood(node: Node): boolean {
    if (and(isText, isVisible(device))(node)) {
      return false;
    }

    if (and(isElement, hasName("code", "kbd", "samp"))(node)) {
      return true;
    }

    return node
      .children({
        flattened: true,
        nested: true,
      })
      .every(isGood);
  };
}

export namespace Outcomes {
  export const IsOk = Ok.of(Diagnostic.of(`Ok`));

  export const IsNotOk = Err.of(Diagnostic.of("Err"));
}
