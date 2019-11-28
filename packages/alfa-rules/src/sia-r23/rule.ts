import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { audio } from "../common/applicability/audio";

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
                  return Err.of("The <audio> element has no transcript");
                }

                if (
                  transcriptLink
                    .filter(and(Element.isElement, isPerceivable(device)))
                    .isNone()
                ) {
                  return Err.of(
                    "The <audio> has a link to transcript, but the link is not perceivable"
                  );
                }

                return Question.of(
                  "transcript-perceivable",
                  "boolean",
                  target,
                  "Is the transcript of the <audio> element perceivable?"
                ).map(isPerceivable =>
                  isPerceivable
                    ? Ok.of(
                        "The <audio> element has a transcript that is perceivable"
                      )
                    : Err.of(
                        "The <audio> element has a transcript that is not perceivable"
                      )
                );
              });
            }

            return transcript
              .filter(and(Element.isElement, isPerceivable(device)))
              .isSome()
              ? Ok.of(
                  "The <audio> element has a transcript that is perceivable"
                )
              : Err.of(
                  "The <audio> element has a transcript that is not perceivable"
                );
          })
        };
      }
    };
  }
});
