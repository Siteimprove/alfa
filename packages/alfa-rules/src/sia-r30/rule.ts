import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Some } from "@siteimprove/alfa-option";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

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
          1: outcomes.some(Outcome.isPassed)
            ? Outcomes.HasTextAlternative
            : Outcomes.HasNoTextAlternative
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasTextAlternative = Some.of(
    Ok.of("The <audio> element has a text alternative") as Result<
      string,
      string
    >
  );

  export const HasNoTextAlternative = Some.of(
    Err.of("The <audio> element has no text alternative") as Result<
      string,
      string
    >
  );
}
