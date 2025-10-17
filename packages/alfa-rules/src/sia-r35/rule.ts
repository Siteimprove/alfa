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

import R26 from "../sia-r26/rule.js";
import R32 from "../sia-r32/rule.js";
import R33 from "../sia-r33/rule.js";
import { Scope, Stability } from "../tags/index.js";

export default Rule.Composite.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r35",
  requirements: [
    Criterion.of("1.2.1"),
    EAA.of("9.1.2.1"),
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
