import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

const { isElement } = Element;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r20",
  evaluate({ document }) {
    return {
      applicability() {
        return document
          .descendants({ composed: true, nested: true })
          .filter(isElement)
          .flatMap((element) =>
            Sequence.from(element.attributes).filter((attribute) =>
              attribute.name.startsWith("aria-")
            )
          );
      },

      expectations(target) {
        const exists = aria.Attribute.isName(target.name);

        return {
          1: expectation(
            exists,
            () => Outcomes.IsDefined,
            () => Outcomes.IsNotDefined
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsDefined = Ok.of(Diagnostic.of(`The attribute is defined`));

  export const IsNotDefined = Err.of(
    Diagnostic.of(`The attribute is not defined`)
  );
}
