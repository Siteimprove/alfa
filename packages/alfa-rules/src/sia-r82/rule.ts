import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Question } from "../common/act/question";

import { isPerceivable } from "../common/predicate";

import { Scope, Stability } from "../tags";

const { hasRole } = DOM;
const { isElement, hasNamespace } = Element;
const { and, test } = Predicate;

/**
 * R82 ask questions whose subject is not the target of the rule.
 * The context of the question is still the test target, but the
 * subjects can be various other elements.
 * This needs changes in Dory, Nemo, and likely databases to be stored;
 * this needs changes in the Page Report to be able to highlight an element
 * different from the test target.
 */
export default Rule.Atomic.of<
  Page,
  Element,
  Question.Metadata,
  Node | Array<Node>
>({
  uri: "https://alfa.siteimprove.com/rules/sia-r82",
  requirements: [Criterion.of("3.3.1")],
  tags: [Scope.Component, Stability.Experimental],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasRole(
                device,
                "checkbox",
                "combobox",
                "listbox",
                "menuitemcheckbox",
                "menuitemradio",
                "radio",
                "searchbox",
                "slider",
                "spinbutton",
                "switch",
                "textbox"
              )
            )
          );
      },

      expectations(target) {
        const indicators = Question.of("error-indicators", target).map(
          Array.from
        );

        return {
          1: indicators.map((indicators) =>
            expectation<Question.Metadata, Array<Node>, Element, 0>(
              indicators.length === 0,
              () => Outcomes.HasNoErrorIndicator,
              () => identifiesTarget(target, indicators, device)
            )
          ),

          2: indicators.map((indicators) =>
            expectation<Question.Metadata, Array<Node>, Element, 0>(
              indicators.length === 0,
              () => Outcomes.HasNoErrorIndicator,
              () => describesResolution(target, indicators, device)
            )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasNoErrorIndicator = Ok.of(
    Diagnostic.of(`The form field has no error indicator`)
  );

  export const ErrorIndicatorIdentifiesTarget = Ok.of(
    Diagnostic.of(
      `At least one error indicator that is perceivable identifies the form field`
    )
  );

  export const ErrorIndicatorIdentifiesTargetButIsNotPerceivable = Err.of(
    Diagnostic.of(
      `At least one error indicator identifies the form field, but the error
    indicator is not perceivable`
    )
  );

  export const NoErrorIndicatorIdentifiesTarget = Err.of(
    Diagnostic.of(`None of the error indicators identify the form field`)
  );

  export const ErrorIndicatorDescribesResolution = Ok.of(
    Diagnostic.of(
      `At least one error indicator that is perceivable describes the cause of the
    error or how to resolve it`
    )
  );

  export const ErrorIndicatorDescribesResolutionButIsNotPerceivable = Err.of(
    Diagnostic.of(
      `At least one error indicator describes the cause of the error or how to
    resolve it, but the error indicator is not perceivable`
    )
  );

  export const NoErrorIndicatorDescribesResolution = Err.of(
    Diagnostic.of(
      `None of the error indicators describe the cause of the error or how to
    resolve it`
    )
  );
}

const identifiesTarget = (
  target: Element,
  indicators: Array<Node>,
  device: Device
) =>
  Question.of("error-indicator-identifying-form-field", indicators, target).map(
    (indicator) =>
      expectation(
        indicator.isNone(),
        () => Outcomes.NoErrorIndicatorIdentifiesTarget,
        () =>
          expectation(
            test(isPerceivable(device), indicator.get()),
            () => Outcomes.ErrorIndicatorIdentifiesTarget,
            () => Outcomes.ErrorIndicatorIdentifiesTargetButIsNotPerceivable
          )
      )
  );

const describesResolution = (
  target: Element,
  indicators: Array<Node>,
  device: Device
) =>
  Question.of("error-indicator-describing-resolution", indicators, target).map(
    (indicator) =>
      expectation(
        indicator.isNone(),
        () => Outcomes.NoErrorIndicatorDescribesResolution,
        () =>
          expectation(
            test(isPerceivable(device), indicator.get()),
            () => Outcomes.ErrorIndicatorDescribesResolution,
            () => Outcomes.ErrorIndicatorDescribesResolutionButIsNotPerceivable
          )
      )
  );
