import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Trilean } from "@siteimprove/alfa-trilean";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { isPassed } from "../common/act/is-passed";
import { Question } from "../common/act/question";

import R26 from "../sia-r26/rule";
import R32 from "../sia-r32/rule";
import R33 from "../sia-r33/rule";
import { Scope, Stability } from "../tags";

export default Rule.Composite.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r35",
  requirements: [
    Criterion.of("1.2.1"),
    Technique.of("G159"),
    Technique.of("G166"),
  ],
  tags: [Scope.Component, Stability.Stable],
  composes: [R26, R32, R33],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            Trilean.some(outcomes, isPassed),
            () => Outcomes.HasAlternative,
            () => Outcomes.HasNoAlternative,
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
  export const HasAlternative = Ok.of(
    Diagnostic.of(`The \`<video>\` element has an alternative`),
  );

  export const HasNoAlternative = Err.of(
    Diagnostic.of(`The \`<video>\` element does not have an alternative`),
  );
}
