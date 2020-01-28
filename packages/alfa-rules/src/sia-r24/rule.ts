import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Some } from "@siteimprove/alfa-option";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.githu.io/sanshikan/rules/sia-r24.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        return {
          1: Question.of(
            "transcript",
            "node",
            target,
            "Where is the transcript of the <video> element?"
          ).map(transcript => {
            return transcript.isSome()
              ? Outcomes.HasTranscript
              : Question.of(
                  "transcript-link",
                  "node",
                  target,
                  "Where is the link pointing to the transcript of the <video> element?"
                ).map(transcriptLink =>
                  transcriptLink.isSome()
                    ? Outcomes.HasTranscript
                    : Outcomes.HasNoTranscript
                );
          })
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasTranscript = Some.of(
    Ok.of("The <video> element has a transcript") as Result<string, string>
  );

  export const HasNoTranscript = Some.of(
    Err.of("The <video> element does not have a transcript") as Result<
      string,
      string
    >
  );
}
