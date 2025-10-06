import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM, Node } from "@siteimprove/alfa-aria";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom";

import { expectation } from "../common/act/expectation.js";
import { Scope, Stability } from "../tags/index.js";

const { isMarkedDecorative } = DOM;
const { hasName, hasNamespace } = Element;
const { and, or, not } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r67",
  requirements: [Criterion.of("1.1.1"), EAA.of("9.1.1.1")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, dom.Node.fullTree).filter(
          and(
            or(
              and(hasNamespace(Namespace.HTML), hasName("img")),
              and(hasNamespace(Namespace.SVG), hasName("svg")),
            ),
            isMarkedDecorative,
          ),
        );
      },

      expectations(target) {
        return {
          1: expectation(
            Node.from(target, device).role.some(
              not((role) => role.isPresentational()),
            ),
            () => Outcomes.IsExposed,
            () => Outcomes.IsNotExposed,
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
  export const IsNotExposed = Ok.of(
    Diagnostic.of(`The element is marked as decorative and is not exposed`),
  );

  export const IsExposed = Err.of(
    Diagnostic.of(`The element is marked as decorative but is exposed`),
  );
}
