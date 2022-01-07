import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { isPassed } from "../common/expectation/is-passed";

import { Question } from "../common/question";

import R48 from "../sia-r48/rule";
import R49 from "../sia-r49/rule";
import { Scope } from "../tags";

export default Rule.Composite.of<Page, Element, Question.Type, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r50",
  requirements: [
    Criterion.of("1.4.2"),
    Technique.of("G60"),
    Technique.of("G170"),
    Technique.of("G171"),
  ],
  tags: [Scope.Component],
  composes: [R48, R49],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            Trilean.some(outcomes, isPassed),
            () => Outcomes.AutoplayGood,
            () => Outcomes.AutoplayBad
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const AutoplayGood = Ok.of(
    Diagnostic.of(
      `The total duration of the autoplaying audio output of the element either
      lasts no longer than 3 seconds or a mechanism to pause or stop the audio
      is available`
    )
  );

  export const AutoplayBad = Err.of(
    Diagnostic.of(
      `The total duration of the autoplaying audio output of the element lasts
      longer than 3 seconds and no mechanism to pause or stop the audio is
      available`
    )
  );
}
