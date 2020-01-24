import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate, some, Trilean } from "@siteimprove/alfa-trilean";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Noresult } from "@siteimprove/alfa-result/src/noresult";
import { Page } from "@siteimprove/alfa-web";

const { fold } = Predicate;

import { Question } from "../common/question";

import R24 from "../sia-r24/rule";
import R25 from "../sia-r25/rule";
import R31 from "../sia-r31/rule";
import R36 from "../sia-r36/rule";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r38.html",
  composes: [R24, R25, R31, R36],
  evaluate() {
    return {
      expectations(outcomes) {
        return {
          1: fold(
            some(outcomeToTrilean),
            outcomes,
            () => Outcomes.HasAlternative,
            () => Outcomes.HasNoAlternative,
            () => Noresult
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasAlternative = Ok.of(
    "The <video> element has an audio or text alternative"
  );

  export const HasNoAlternative = Err.of(
    "The <video> element does not have an audio or text alternative"
  );
}

function outcomeToTrilean<I, T, Q>(
  outcome: Outcome.Applicable<I, T, Q>
): Trilean {
  if (Outcome.isPassed(outcome)) return true;
  if (Outcome.isFailed(outcome)) return false;
  return undefined;
}
