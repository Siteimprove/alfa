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
            `Where is the transcript of the \`<audio>\` element?`
          ).map((transcript) => {
            if (transcript.isNone()) {
              return Question.of(
                "transcript-link",
                target,
                `Where is the link pointing to a perceivable transcript of the \`<audio>\` element?`
              ).map((transcriptLink) => {
                if (transcriptLink.isNone()) {
                  return Option.of(Outcomes.HasNoTranscriptLink);
                }

                if (
                  transcriptLink
                    .filter(and(Element.isElement, isPerceivable(device)))
                    .isNone()
                ) {
                  return Option.of(Outcomes.HasNonPerceivableLink);
                }

                return Option.of(Outcomes.HasPerceivableLink);
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

    export const HasPerceivableLink = Ok.of(
      Diagnostic.of(
        `The \`<audio>\` element has a link that is perceivable`
      )
    );

  export const HasNoTranscriptLink = Err.of(
    Diagnostic.of(`The \`<audio>\` element has no transcript link`)
  );

  export const HasNonPerceivableLink = Err.of(
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
