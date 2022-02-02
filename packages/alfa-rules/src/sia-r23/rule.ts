import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { audio } from "../common/applicability/audio";

import { expectation } from "../common/act/expectation";
import { Question } from "../common/act/question";

import { isPerceivable } from "../common/predicate";

import { Scope } from "../tags";

const { and } = Predicate;

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r23",
  tags: [Scope.Component],
  evaluate({ document, device }) {
    return {
      applicability() {
        return audio(document, device);
      },

      expectations(target) {
        return {
          1: Question.of(
            "transcript",
            target,
            Diagnostic.of(`Where is the transcript of the \`<audio>\` element?`)
          ).map((transcript) => {
            if (transcript.isNone()) {
              return Question.of(
                "transcript-link",
                target,
                Diagnostic.of(
                  `Where is the link pointing to the transcript of the \`<audio>\` element?`
                )
              ).map((transcriptLink) => {
                if (transcriptLink.isNone()) {
                  return Option.of(Outcomes.HasNoTranscript);
                }

                if (
                  transcriptLink
                    .filter(and(Element.isElement, isPerceivable(device)))
                    .isNone()
                ) {
                  return Option.of(Outcomes.HasNonPerceivableTranscriptLink);
                }

                return Question.of(
                  "transcript-perceivable",
                  target,
                  Diagnostic.of(
                    `Is the transcript of the \`<audio>\` element perceivable?`
                  )
                ).map((isPerceivable) =>
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
          }),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasPerceivableTranscript = Ok.of(
    Diagnostic.of(
      `The \`<audio>\` element has a transcript that is perceivable`
    )
  );

  export const HasNoTranscript = Err.of(
    Diagnostic.of(`The \`<audio>\` element has no transcript`)
  );

  export const HasNonPerceivableTranscriptLink = Err.of(
    Diagnostic.of(
      `The \`<audio>\` has a link to transcript, but the link is not perceivable`
    )
  );

  export const HasNonPerceivableTranscript = Err.of(
    Diagnostic.of(
      `The \`<audio>\` element has a transcript that is not perceivable`
    )
  );
}
