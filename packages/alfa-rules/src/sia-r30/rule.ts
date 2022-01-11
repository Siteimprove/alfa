import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { isPassed } from "../common/expectation/is-passed";

import { Question } from "../common/question";

import R23 from "../sia-r23/rule";
import R29 from "../sia-r29/rule";
import { Scope } from "../tags";

export default Rule.Composite.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r30",
  requirements: [Criterion.of("1.2.1"), Technique.of("G158")],
  tags: [Scope.Component],
  composes: [R23, R29],
  evaluate() {
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
    Diagnostic.of(`The \`<audio>\` element has a text alternative`)
  );

  export const HasNoTextAlternative = Err.of(
    Diagnostic.of(`The \`<audio>\` element does not have a text alternative`)
  );
}
