import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Unit } from "@siteimprove/alfa-css";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasTextContent } from "../common/predicate/has-text-content";
import { isVisible } from "../common/predicate/is-visible";

const { isElement, hasName, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r80.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({
            flattened: true,
            nested: true,
          })
          .filter(
            and(
              isElement,
              and(
                and(hasNamespace(Namespace.HTML), (element) =>
                  Style.from(element, device).cascaded("line-height").isSome()
                ),
                and(hasTextContent(), isVisible(device))
              )
            )
          );
      },

      expectations(target) {
        const { value: lineHeight } = Style.from(target, device)
          .cascaded("line-height")
          .get();

        return {
          1: expectation(
            lineHeight.type !== "length" ||
              Unit.Length.isRelative(lineHeight.unit),
            () => Outcomes.HasRelativeUnit,
            () => Outcomes.HasAbsoluteUnit
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasRelativeUnit = Ok.of(
    Diagnostic.of(`The line height is specified using a relative unit`)
  );

  export const HasAbsoluteUnit = Err.of(
    Diagnostic.of(`The line height is specified using an absolute unit`)
  );
}
