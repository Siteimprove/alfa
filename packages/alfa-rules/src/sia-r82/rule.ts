import { Rule, Interview } from "@siteimprove/alfa-act";
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
          .filter(
            and(
              isElement,
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
            )
          );
      },

      expectations(target) {
        const indicators = Question.of(
          "error-indicators",
          "node[]",
          target,
          "Where are the error indicators, if any, for the form field?"
        ).map((indicators) => [...indicators]);

        return {
          1: indicators.map((indicators) =>
            expectation(
              indicators.length === 0,
              () => Outcomes.HasNoErrorIndicator,
              () => {
                function identifiesTarget(
                  indicators: Array<Node>
                ): Interview<
                  Question,
                  Node,
                  Option.Maybe<Result<string, string>>
                > {
                  const next = indicators[0];

                  if (next === undefined) {
                    return Outcomes.NoErrorIndicatorIdentifiesTarget;
                  }

                  return Question.of(
                    "error-indicator-identifies-form-field",
                    "boolean",
                    next,
                    "Does the error indicator identify the form field it relates to?"
                  ).map((isIdentified) => {
                    if (isIdentified) {
                      return Outcomes.ErrorIndicatorIdentifiesTarget;
                    }

                    return identifiesTarget(indicators.slice(1));
                  });
                }

                return identifiesTarget(indicators);
              }
            )
          ),

          2: indicators.map((indicators) =>
            expectation(
              indicators.length === 0,
              () => Outcomes.HasNoErrorIndicator,
              () => {
                function describesResolution(
                  indicators: Array<Node>,
                  error: Err<string>
                ): Interview<
                  Question,
                  Node,
                  Option.Maybe<Result<string, string>>
                > {
                  const indicator = indicators[0];

                  if (indicator === undefined) {
                    return error;
                  }

                  return Question.of(
                    "error-indicator-describes-resolution",
                    "boolean",
                    indicator,
                    "Does the error indicator describe the cause of the error or how to resolve it?"
                  ).map((isDescribed) => {
                    if (isDescribed) {
                      if (test(isPerceivable(device), indicator)) {
                        return Outcomes.ErrorIndicatorDescribesResolution;
                      } else {
                        error = Outcomes.ErrorIndicatorIsNotPerceivable;
                      }
                    }

                    return describesResolution(indicators.slice(1), error);
                  });
                }

                return describesResolution(
                  indicators,
                  Outcomes.NoErrorIndicatorDescribesResolution
                );
              }
            )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasNoErrorIndicator = Ok.of(
    "The form field has no error indicator"
  );

  export const ErrorIndicatorIdentifiesTarget = Ok.of(
    "At least one error indicator identifies the form field"
  );

  export const NoErrorIndicatorIdentifiesTarget = Err.of(
    "None of the error indicators identify the form field"
  );

  export const ErrorIndicatorDescribesResolution = Ok.of(
    `At least one error indicator that is perceivable describes the cause of the
    error or how to resolve it`
  );

  export const ErrorIndicatorIsNotPerceivable = Err.of(
    `At least one error indicator describes the cause of the error or how to
    resolve it, but the error indicator is not perceivable`
  );

  export const NoErrorIndicatorDescribesResolution = Err.of(
    `None of the error indicators describe the cause of the error or how to
    resolve it`
  );
}
