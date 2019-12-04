import { Outcome, Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { Question } from "../common/question";

import R22 from "../sia-r22/rule";
import R31 from "../sia-r31/rule";

export default Rule.Composite.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r27.html",
  composes: [R22, R31],
  evaluate: () => {
    return {
      expectations(outcomes) {
        return {
          1: outcomes.some(Outcome.isPassed)
            ? Ok.of(
                "The <video> element has a text alternative for its audio content"
              )
            : Err.of(
                "The <video> element has no text alternative for its audio content"
              )
        };
      }
    };
  }
});
