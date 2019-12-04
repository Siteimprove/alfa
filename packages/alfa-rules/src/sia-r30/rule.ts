import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
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
            ? Ok.of("The <audio> element has a text alternative")
            : Err.of("The <audio> element has no text alternative")
        };
      }
    };
  }
});
