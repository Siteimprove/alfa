import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectations/expectation";

import { Question } from "../common/question";

import R26 from "../sia-r26/rule";
import R32 from "../sia-r32/rule";
import R33 from "../sia-r33/rule";
import R34 from "../sia-r34/rule";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r35.html",
  composes: [R26, R32, R33, R34],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            outcomes.some(Outcome.isPassed),
            Outcomes.HasAlternative,
            Outcomes.HasNoAlternative
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasAlternative = Ok.of("The <video> element has an alternative");

  export const HasNoAlternative = Err.of(
    "The <video> element does not have an alternative"
  );
}
