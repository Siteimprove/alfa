import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { some } from "@siteimprove/alfa-trilean";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { outcomeToTrilean } from "../common/expectation/outcome-to-trilean";

import { Question } from "../common/question";

import R23 from "../sia-r23/rule";
import R29 from "../sia-r29/rule";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r30.html",
  composes: [R23, R29],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            some(outcomeToTrilean)(outcomes),
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
