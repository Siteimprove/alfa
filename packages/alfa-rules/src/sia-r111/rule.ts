import { Page } from "@siteimprove/alfa-web";
import { Element, Query } from "@siteimprove/alfa-dom";
import { Diagnostic, Rule } from "@siteimprove/alfa-act";

import * as dom from "@siteimprove/alfa-dom";
import { expectation } from "../common/act/expectation";
import { Err, Ok } from "@siteimprove/alfa-result";

const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r111",
  requirements: [], // TODO
  evaluate({ device, document }) {
    return {
      applicability() {
        // TODO: Get elements that can receive pointer events
        return getElementDescendants(document, dom.Node.fullTree);
      },

      expectations(target) {
        // TODO: Handle missing layout
        const box = target.getBoundingBox(device).getUnsafe();

        return {
          1: expectation(
            box.width >= 44 && box.height >= 44,
            () => Outcomes.HasSufficientSize,
            () => Outcomes.HasInsufficientSize,
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
  export const HasSufficientSize = Ok.of(
    Diagnostic.of("Target has sufficient size"),
  );

  export const HasInsufficientSize = Err.of(
    Diagnostic.of("Target has insufficient size"),
  );
}
