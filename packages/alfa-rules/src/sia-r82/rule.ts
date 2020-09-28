import { Rule, Interview, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Option } from "@siteimprove/alfa-option";
import { Result, Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isPerceivable } from "../common/predicate/is-perceivable";

import { Question } from "../common/question";

const { isElement, hasNamespace } = Element;
const { and, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r82.html",
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
          "error-indicators",
          "node[]",
          target,
          `Where are the error indicators, if any, for the form field?`
        ).map((indicators) => [...indicators]);

        return {
          1: <Interview<Question, Element, Option<Result<Diagnostic>>>>(
            indicators.map((indicators) =>
              expectation(
                indicators.length === 0,
                () => Outcomes.HasNoErrorIndicator,
                () =>
                  identifiesTarget(
                    indicators,
                    Outcomes.NoErrorIndicatorIdentifiesTarget,
                    device
                  )
              )
            )
          ),

          2: <Interview<Question, Element, Option<Result<Diagnostic>>>>(
            indicators.map((indicators) =>
              expectation(
                indicators.length === 0,
                () => Outcomes.HasNoErrorIndicator,
                () =>
                  describesResolution(
                    indicators,
                    Outcomes.NoErrorIndicatorDescribesResolution,
                    device
                  )
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
  indicators: Array<Node>,
  error: Err<Diagnostic>,
  device: Device
): Interview<Question, Node, Result<Diagnostic>> {
  const indicator = indicators[0];

  if (indicator === undefined) {
    return error;
  }

  return Question.of(
    "error-indicator-identifies-form-field",
    "boolean",
    indicator,
    "Does the error indicator identify, in text, the form field it relates to?"
  ).map((isIdentified) => {
    if (isIdentified) {
      if (test(isPerceivable(device), indicator)) {
        return Outcomes.ErrorIndicatorIdentifiesTarget;
      } else {
        error = Outcomes.ErrorIndicatorIdentifiesTargetButIsNotPerceivable;
      }
    }

    return identifiesTarget(indicators.slice(1), error, device);
  });
}

function describesResolution(
  indicators: Array<Node>,
  error: Err<Diagnostic>,
  device: Device
): Interview<Question, Node, Result<Diagnostic>> {
  const indicator = indicators[0];

  if (indicator === undefined) {
    return error;
  }

  return Question.of(
    "error-indicator-describes-resolution",
    "boolean",
    indicator,
    `Does the error indicator describe, in text, the cause of the error or how
    to resolve it?`
  ).map((isDescribed) => {
    if (isDescribed) {
      if (test(isPerceivable(device), indicator)) {
        return Outcomes.ErrorIndicatorDescribesResolution;
      } else {
        error = Outcomes.ErrorIndicatorDescribesResolutionButIsNotPerceivable;
      }
    }

    return describesResolution(indicators.slice(1), error, device);
  });
}
