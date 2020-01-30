import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectations/expectation";

import { Question } from "../common/question";

import R48 from "../sia-r48/rule";
import R49 from "../sia-r49/rule";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r50.html",
  composes: [R48, R49],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: expectation(
            outcomes.some(Outcome.isPassed),
            Outcomes.AutoplayGood,
            Outcomes.AutoplayBad
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const AutoplayGood = Ok.of(
    `The total duration of the autoplaying audio output of the
                element either lasts no longer than 3 seconds or a mechanism to
                pause or stop the audio is available`
  );

  export const AutoplayBad = Err.of(
    `The total duration of the autoplaying audio output of the
                element lasts longer than 3 seconds and no mechanism to pause or
                stop the audio is available`
  );
}
