import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { expectation } from "../common/act/expectation";

import { Question } from "../common/act/question";
import { Scope } from "../tags";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r24",
  requirements: [Criterion.of("1.2.8"), Technique.of("G69")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        return {
          1: Question.of(
            "transcript",
            target,
            Diagnostic.of(`Where is the transcript of the \`<video>\` element?`)
          ).map((transcript) =>
            expectation(
              transcript.isSome(),
              () => Outcomes.HasTranscript,
              () =>
                Question.of(
                  "transcript-link",
                  target,
                  Diagnostic.of(
                    `Where is the link pointing to the transcript of the \`<video>\` element?`
                  )
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
