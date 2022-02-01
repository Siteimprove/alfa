import { Rule, Interview, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Result, Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Question } from "../common/act/question";

import { hasRole, isPerceivable } from "../common/predicate";

import { Scope, Stability } from "../tags";

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
export default Rule.Atomic.of<Page, Element, Question.Metadata, Node>({
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
          (indicators) => [...indicators]
        );

        return {
          1: indicators.map((indicators) =>
            expectation(
              indicators.length === 0,
              () => Outcomes.HasNoErrorIndicator,
              () =>
                identifiesTarget(
                  target,
                  indicators,
                  Outcomes.NoErrorIndicatorIdentifiesTarget,
                  device
                )
            )
          ),

          2: indicators.map((indicators) =>
            expectation(
              indicators.length === 0,
              () => Outcomes.HasNoErrorIndicator,
              () =>
                describesResolution(
                  target,
                  indicators,
                  Outcomes.NoErrorIndicatorDescribesResolution,
                  device
                )
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

function identifiesTarget(
  target: Element,
  indicators: Array<Node>,
  error: Err<Diagnostic>,
  device: Device
): Interview<Question.Metadata, Node, Element, Result<Diagnostic>> {
  const indicator = indicators[0];

  if (indicator === undefined) {
    return error;
  }

  return Question.of(
    "error-indicator-identifies-form-field",
    indicator,
    target
  ).map((isIdentified) => {
    if (isIdentified) {
      if (test(isPerceivable(device), indicator)) {
        return Outcomes.ErrorIndicatorIdentifiesTarget;
      } else {
        error = Outcomes.ErrorIndicatorIdentifiesTargetButIsNotPerceivable;
      }
    }

    return identifiesTarget(target, indicators.slice(1), error, device);
  });
}

function describesResolution(
  target: Element,
  indicators: Array<Node>,
  error: Err<Diagnostic>,
  device: Device
): Interview<Question.Metadata, Node, Element, Result<Diagnostic>> {
  const indicator = indicators[0];

  if (indicator === undefined) {
    return error;
  }

  return Question.of(
    "error-indicator-describes-resolution",
    indicator,
    target
  ).map((isDescribed) => {
    if (isDescribed) {
      if (test(isPerceivable(device), indicator)) {
        return Outcomes.ErrorIndicatorDescribesResolution;
      } else {
        error = Outcomes.ErrorIndicatorDescribesResolutionButIsNotPerceivable;
      }
    }

    return describesResolution(target, indicators.slice(1), error, device);
  });
}
