import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { some } from "@siteimprove/alfa-trilean";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { outcomeToTrilean } from "../common/expectation/outcome-to-trilean";

import { Question } from "../common/question";

import R24 from "../sia-r24/rule";
import R25 from "../sia-r25/rule";
import R31 from "../sia-r31/rule";
import R36 from "../sia-r36/rule";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r38.html",
  requirements: [
    Criterion.of("1.2.3"),
    Criterion.of("1.2.5"),
    Criterion.of("1.2.8"),
    Technique.of("G8"),
    Technique.of("G69"),
    Technique.of("G78"),
    Technique.of("G173"),
    Technique.of("H96"),
  ],
  composes: [R24, R25, R31, R36],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            some(outcomeToTrilean)(outcomes),
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
    Diagnostic.of(`The \`<video>\` element has an audio or text alternative`)
  );

  export const HasNoAlternative = Err.of(
    Diagnostic.of(
      `The \`<video>\` element does not have an audio or text alternative`
    )
  );
}
