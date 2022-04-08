import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { isIgnored, isMarkedDecorative } = DOM;
const { isElement } = Element;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r86",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(isMarkedDecorative);
      },

      expectations(target) {
        return {
          1: expectation(
            isIgnored(device)(target),
            () => Outcomes.IsNotExposed,
            () => Outcomes.IsExposed
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotExposed = Ok.of(
    Diagnostic.of(`The element is marked as decorative and is not exposed`)
  );

  export const IsExposed = Err.of(
    Diagnostic.of(`The element is marked as decorative but is exposed`)
  );
}
