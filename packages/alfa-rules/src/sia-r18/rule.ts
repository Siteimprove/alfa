import { Rule } from "@siteimprove/alfa-act";
import { Role } from "@siteimprove/alfa-aria";
import { Attribute, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Page } from "@siteimprove/alfa-web";

import * as aria from "@siteimprove/alfa-aria";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isIgnored } from "../common/predicate/is-ignored";

const { and, not, test } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r18.html",
  evaluate({ device, document }) {
    const global = Set.from(
      Role.lookup("roletype").get().characteristics.supports
    );

    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(and(Element.isElement, not(isIgnored(device))))
          .flatMap((element) =>
            Sequence.from(element.attributes).filter((attribute) =>
              aria.Attribute.lookup(attribute.name).isSome()
            )
          );
      },

      expectations(target) {
        return {
          1: expectation(
            global.has(target.name) ||
              test(
                hasRole((role) =>
                  role.isAllowed((attribute) => attribute.name === target.name)
                ),
                target.owner.get()
              ),
            () => Outcomes.IsAllowed,
            () => Outcomes.IsNotAllowed
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsAllowed = Ok.of(
    "The attribute is allowed for the element on which it is specified"
  );

  export const IsNotAllowed = Err.of(
    "The attribute is not allowed for the element on which it is specified"
  );
}
