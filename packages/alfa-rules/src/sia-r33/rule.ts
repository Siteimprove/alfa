import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { expectation } from "../common/expectation";

import { Question } from "../common/question";
import { Scope } from "../tags/scope";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r33",
  requirements: [Technique.of("G159")],
  tags: [Scope.Component],
  evaluate: ({ device, document }) => {
    return {
      applicability() {
        return video(document, device, { audio: { has: false } });
      },

      expectations(target) {
        return {
          1: Question.of(
            "node",
            "transcript",
            `Where is the transcript of the \`<video>\` element?`,
            target
          ).map((transcript) =>
            expectation(
              transcript.isSome(),
              () => Outcomes.HasTranscript,
              () =>
                Question.of(
                  "node",
                  "transcript-link",
                  `Where is the link pointing to the transcript of the \`<video>\` element?`,
                  target
                ).map((transcriptLink) =>
                  expectation(
                    transcriptLink.isSome(),
                    () => Outcomes.HasTranscript,
                    () => Outcomes.HasNoTranscript
                  )
                )
            )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasTranscript = Ok.of(
    Diagnostic.of(`The \`<video>\` element has a transcript`)
  );

  export const HasNoTranscript = Err.of(
    Diagnostic.of(`The \`<video>\` element does not have a transcript`)
  );
}
