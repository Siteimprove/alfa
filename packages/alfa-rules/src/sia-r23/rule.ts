import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { audio } from "../common/applicability/audio";

import { expectation } from "../common/expectation";

import { isPerceivable } from "../common/predicate/is-perceivable";

import { Question } from "../common/question";

const { and } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r23.html",
  evaluate({ document, device }) {
    return {
      applicability() {
        return audio(document, device);
      },

      expectations(target) {
        return {
          1: Question.of(
            "transcript",
            "node",
            target,
            "Where is the transcript of the <audio> element?"
          ).map(transcript => {
            if (transcript.isNone()) {
              return Question.of(
                "transcript-link",
                "node",
                target,
                "Where is the link pointing to the transcript of the <audio> element?"
              ).map(transcriptLink => {
                if (transcriptLink.isNone()) {
                  return Some.of(Outcomes.HasNoTranscript);
                }

                if (
                  transcriptLink
                    .filter(and(Element.isElement, isPerceivable(device)))
                    .isNone()
                ) {
                  return Some.of(Outcomes.HasNonPerceivableTranscriptLink);
                }

                return Question.of(
                  "transcript-perceivable",
                  "boolean",
                  target,
                  "Is the transcript of the <audio> element perceivable?"
                ).map(isPerceivable =>
                  expectation(
                    isPerceivable,
                    () => Outcomes.HasPerceivableTranscript,
                    () => Outcomes.HasNonPerceivableTranscript
                  )
                );
              });
            }

            return expectation(
              transcript.some(and(Element.isElement, isPerceivable(device))),
              () => Outcomes.HasPerceivableTranscript,
              () => Outcomes.HasNonPerceivableTranscript
            );
          })
        };
      }
    };
  }
});

export namespace Outcomes {
  export const HasPerceivableTranscript = Ok.of(
    "The <audio> element has a transcript that is perceivable"
  );

  export const HasNoTranscript = Err.of(
    "The <audio> element has no transcript"
  );

  export const HasNonPerceivableTranscriptLink = Err.of(
    "The <audio> has a link to transcript, but the link is not perceivable"
  );

  export const HasNonPerceivableTranscript = Err.of(
    "The <audio> element has a transcript that is not perceivable"
  );
}
