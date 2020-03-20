import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { expectation } from "../common/expectation";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r33.html",
  evaluate: ({ device, document }) => {
    return {
      applicability() {
        return video(document, device, { audio: { has: false } });
      },

      expectations(target) {
        return {
          1: Question.of(
            "transcript",
            "node",
            target,
            "Where is the transcript of the <video> element?"
          ).map(transcript =>
            expectation(
              transcript.isSome(),
              () => Outcomes.HasTranscript,
              () =>
                Question.of(
                  "transcript-link",
                  "node",
                  target,
                  "Where is the link pointing to the transcript of the <video> element?"
                ).map(transcriptLink =>
                  expectation(
                    transcriptLink.isSome(),
                    () => Outcomes.HasTranscript,
                    () => Outcomes.HasNoTranscript
                  )
                )
            )
          )
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasTranscript = Ok.of("The <video> element has a transcript");

  export const HasNoTranscript = Err.of(
    "The <video> element does not have a transcript"
  );
}
