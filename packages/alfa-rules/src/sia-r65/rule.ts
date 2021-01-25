import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasOutline } from "../common/predicate/has-outline";
import { hasTextDecoration } from "../common/predicate/has-text-decoration";
import { isTabbable } from "../common/predicate/is-tabbable";

import { Question } from "../common/question";

const { isElement } = Element;
const { or, xor, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r65.html",
  requirements: [Criterion.of("2.4.7")],
  evaluate({ device, document }) {
    return {
      applicability() {
        const tabbables = document.tabOrder().filter(isTabbable(device));

        // Peak the first two tabbable elements to avoid forcing the whole
        // sequence. If the size of the resulting sequence is less than 2 then
        // fewer than 2 tabbable elements exist.
        if (tabbables.take(2).size < 2) {
          return [];
        }

        return tabbables;
      },

      expectations(target) {
        return {
          1: expectation(
            hasFocusIndicator(device)(target),
            () => Outcomes.HasFocusIndicator,
            () =>
              Question.of(
                "has-focus-indicator",
                "boolean",
                target,
                `Does the element have a visible focus indicator?`
              ).map((hasFocusIndicator) =>
                expectation(
                  hasFocusIndicator,
                  () => Outcomes.HasFocusIndicator,
                  () => Outcomes.HasNoFocusIndicator
                )
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasFocusIndicator = Ok.of(
    Diagnostic.of(`The element has a visible focus indicator`)
  );

  export const HasNoFocusIndicator = Err.of(
    Diagnostic.of(`The element does not have a visible focus indicator`)
  );
}

function hasFocusIndicator(device: Device): Predicate<Element> {
  return (element) => {
    const withFocus = Context.focus(element);

    return element
      .inclusiveDescendants({
        flattened: true,
      })
      .concat(
        element.ancestors({
          flattened: true,
        })
      )
      .filter(isElement)
      .some(
        or(
          xor(hasOutline(device), hasOutline(device, withFocus)),
          xor(hasTextDecoration(device), hasTextDecoration(device, withFocus))
        )
      );
  };
}
