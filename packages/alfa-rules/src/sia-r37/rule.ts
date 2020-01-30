import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectations/expectation";

import { Question } from "../common/question";

import R25 from "../sia-r25/rule";
import R31 from "../sia-r31/rule";
import R36 from "../sia-r36/rule";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r37.html",
  composes: [R25, R31, R36],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            outcomes.some(Outcome.isPassed),
            Outcomes.HasAudioDescription,
            Outcomes.HasNoAudioDescription
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasAudioDescription = Ok.of(
    "The <video> element has an audio description"
  );

  export const HasNoAudioDescription = Err.of(
    "The <video> element does not have an audio description"
  );
}
