import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { isPassed } from "../common/expectation/is-passed";

import { Question } from "../common/question";

import R26 from "../sia-r26/rule";
import R32 from "../sia-r32/rule";
import R33 from "../sia-r33/rule";
import R34 from "../sia-r34/rule";
import { Scope } from "../tags/scope";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r35",
  requirements: [
    Criterion.of("1.2.1"),
    Technique.of("G159"),
    Technique.of("G166"),
    Technique.of("H96"),
  ],
  tags: [Scope.Component],
  composes: [R26, R32, R33, R34],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            Trilean.some(outcomes, isPassed),
            () => Outcomes.HasAlternative,
            () => Outcomes.HasNoAlternative
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasAlternative = Ok.of(
    Diagnostic.of(`The \`<video>\` element has an alternative`)
  );

  export const HasNoAlternative = Err.of(
    Diagnostic.of(`The \`<video>\` element does not have an alternative`)
  );
}
