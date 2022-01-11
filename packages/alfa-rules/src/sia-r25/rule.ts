import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Ok, Err } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { expectation } from "../common/expectation";

import { Question } from "../common/question";
import { Scope } from "../tags";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r25",
  requirements: [Technique.of("G8"), Technique.of("G78"), Technique.of("G173")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        return {
          1: Question.of(
            "has-description",
            target,
            `Is the visual information of the \`<video>\` available through its
            audio or a separate audio description track?`
          ).map((hasAudio) =>
            expectation(
              hasAudio,
              () => Outcomes.HasInformativeAudio,
              () => Outcomes.HasNoInformativeAudio
            )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasInformativeAudio = Ok.of(
    Diagnostic.of(
      `The visual information of the \`<video>\` element is available through audio`
    )
  );

  export const HasNoInformativeAudio = Err.of(
    Diagnostic.of(
      `The visual information of the \`<video>\` element is not available through audio`
    )
  );
}
