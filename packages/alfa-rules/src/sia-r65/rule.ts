import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Color, Length } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { isTabbable } from "../common/predicate/is-tabbable";

import { Question } from "../common/question";

const { isElement } = Element;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r65.html",
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

const hasOutline: Predicate<Style> = (style) =>
  style.computed("outline-width").none(Length.isZero) &&
  style
    .computed("outline-color")
    .none((color) => color.type === "color" && Color.isTransparent(color));

const hasTextDecoration: Predicate<Style> = (style) =>
  style
    .computed("text-decoration-line")
    .none((line) => line.type === "keyword") &&
  style.computed("text-decoration-color").none(Color.isTransparent);

function hasFocusIndicator(device: Device): Predicate<Element> {
  return (element) => {
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
      .some((element) => {
        const unset = Style.from(element, device);
        const focus = Style.from(element, device, Context.focus(element));

        // If the unset state does not have an outline, the focus state may use an
        // outline as a focus indicator.
        if (!hasOutline(unset) && hasOutline(focus)) {
          return true;
        }

        // If the unset state does not have text decoration, the focus state may use
        // text decoration as a focus indicator.
        if (!hasTextDecoration(unset) && hasTextDecoration(focus)) {
          return true;
        }

        return false;
      });
  };
}
