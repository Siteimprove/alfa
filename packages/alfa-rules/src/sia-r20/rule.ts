import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import type { Attribute } from "@siteimprove/alfa-dom";
import { Node, Query } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { LazyList } from "@siteimprove/alfa-lazy-list";
import type { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/act/index.js";
import { ARIA } from "../requirements/index.js";
import { Scope, Stability } from "../tags/index.js";

const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r20",
  requirements: [ARIA.of("https://www.w3.org/TR/wai-aria-1.2/#state_prop_def")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.composedNested).flatMap(
          (element) =>
            LazyList.from(element.attributes).filter((attribute) =>
              attribute.name.startsWith("aria-"),
            ),
        );
      },

      expectations(target) {
        const exists = aria.Attribute.isName(target.name);

        return {
          1: expectation(
            exists,
            () => Outcomes.IsDefined,
            () => Outcomes.IsNotDefined,
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
  export const IsDefined = Ok.of(Diagnostic.of(`The attribute is defined`));

  export const IsNotDefined = Err.of(
    Diagnostic.of(`The attribute is not defined`),
  );
}
