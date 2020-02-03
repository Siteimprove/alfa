import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { expectation } from "../common/expectation";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r22.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        return {
          1: Question.of(
            "has-captions",
            "boolean",
            target,
            "Does the <video> element have captions?"
          ).map(hasCaptions =>
            expectation(
              hasCaptions,
              Outcomes.HasCaptions,
              Outcomes.HasNoCaptions
            )
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasCaptions = Ok.of("The <video> element has captions");

  export const HasNoCaptions = Err.of(
    "The <video> element does not have captions"
  );
}
