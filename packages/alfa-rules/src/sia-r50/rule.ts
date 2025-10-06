import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { isPassed } from "../common/act/is-passed.js";
import type { Question } from "../common/act/question.js";

import R48 from "../sia-r48/rule.js";
import R49 from "../sia-r49/rule.js";

import { Scope, Stability } from "../tags/index.js";

export default Rule.Composite.of<Page, Element, Question.Metadata, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r50",
  requirements: [
    Criterion.of("1.4.2"),
    EAA.of("9.1.4.2"),
    Technique.of("G60"),
    Technique.of("G170"),
    Technique.of("G171"),
  ],
  tags: [Scope.Component, Stability.Stable],
  composes: [R48, R49],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            Trilean.some(outcomes, isPassed),
            () => Outcomes.AutoplayGood,
            () => Outcomes.AutoplayBad,
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
  export const AutoplayGood = Ok.of(
    Diagnostic.of(
      `The total duration of the autoplaying audio output of the element either
      lasts no longer than 3 seconds or a mechanism to pause or stop the audio
      is available`,
    ),
  );

  export const AutoplayBad = Err.of(
    Diagnostic.of(
      `The total duration of the autoplaying audio output of the element lasts
      longer than 3 seconds and no mechanism to pause or stop the audio is
      available`,
    ),
  );
}
