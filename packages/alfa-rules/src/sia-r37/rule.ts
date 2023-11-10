import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { isPassed } from "../common/act/is-passed";
import { Question } from "../common/act/question";

import R25 from "../sia-r25/rule";
import R31 from "../sia-r31/rule";

import { Scope, Stability } from "../tags";

export default Rule.Composite.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r37",
  requirements: [
    Criterion.of("1.2.5"),
    Technique.of("G8"),
    Technique.of("G78"),
    Technique.of("G173"),
  ],
  tags: [Scope.Component, Stability.Stable],
  composes: [R25, R31],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            Trilean.some(outcomes, isPassed),
            () => Outcomes.HasAudioDescription,
            () => Outcomes.HasNoAudioDescription,
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const HasAudioDescription = Ok.of(
    Diagnostic.of(`The \`<video>\` element has an audio description`),
  );

  export const HasNoAudioDescription = Err.of(
    Diagnostic.of(`The \`<video>\` element does not have an audio description`),
  );
}
