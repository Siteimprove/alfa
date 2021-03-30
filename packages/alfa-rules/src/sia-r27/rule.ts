import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { isPassed } from "../common/expectation/is-passed";

import { Question } from "../common/question";

import R22 from "../sia-r22/rule";
import R31 from "../sia-r31/rule";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r27",
  requirements: [
    Criterion.of("1.2.2"),
    Technique.of("G87"),
    Technique.of("G93"),
    Technique.of("H95"),
  ],
  composes: [R22, R31],
  evaluate: () => {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            Trilean.some(outcomes, isPassed),
            () => Outcomes.HasTextAlternative,
            () => Outcomes.HasNoTextAlternative
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasTextAlternative = Ok.of(
    Diagnostic.of(
      `The \`<video>\` element has a text alternative for its audio content`
    )
  );

  export const HasNoTextAlternative = Err.of(
    Diagnostic.of(
      `The \`<video>\` element has no text alternative for its audio content`
    )
  );
}
