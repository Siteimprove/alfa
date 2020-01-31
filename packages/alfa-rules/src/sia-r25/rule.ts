import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { expectation } from "../common/expectation";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r25.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        return {
          1: Question.of(
            "has-description",
            "boolean",
            target,
            "Is the visual information of the <video> available through its audio or a separate audio description track?"
          ).map(hasAudio =>
            expectation(
              hasAudio,
              Outcomes.HasInformativeAudio,
              Outcomes.HasNoInformativeAudio
            )
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasInformativeAudio = Ok.of(
    "The visual information of the <video> element is available through audio"
  );

  export const HasNoInformativeAudio = Err.of(
    "The visual information of the <video> element is not available through audio"
  );
}
