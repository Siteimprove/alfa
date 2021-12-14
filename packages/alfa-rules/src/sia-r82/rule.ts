import { Rule, Interview, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Result, Ok, Err } from "@siteimprove/alfa-result";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole, isPerceivable } from "../common/predicate";

import { Question } from "../common/question";
import { Scope } from "../tags";

const { isElement, hasNamespace } = Element;
const { and, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question, Node>({
  uri: "https://alfa.siteimprove.com/rules/sia-r82",
  requirements: [Criterion.of("3.3.1")],
  tags: [Scope.Component],
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
        const indicators = Question.of(
          "node[]",
          "error-indicators",
          `Where are the error indicators, if any, for the form field?`,
          target
        ).map((indicators) => [...indicators]);

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
): Interview<Question, Node, Element, Result<Diagnostic>> {
  const indicator = indicators[0];

  if (indicator === undefined) {
    return error;
  }

  return Question.of(
    "boolean",
    "error-indicator-identifies-form-field",
    "Does the error indicator identify, in text, the form field it relates to?",
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
): Interview<Question, Node, Element, Result<Diagnostic>> {
  const indicator = indicators[0];

  if (indicator === undefined) {
    return error;
  }

  return Question.of(
    "boolean",
    "error-indicator-describes-resolution",
    `Does the error indicator describe, in text, the cause of the error or how
    to resolve it?`,
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
