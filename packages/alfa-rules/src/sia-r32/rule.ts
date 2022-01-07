import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { expectation } from "../common/expectation";

import { Question } from "../common/question";
import { Scope } from "../tags";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r32",
  requirements: [Technique.of("G166")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: false } });
      },

      expectations(target) {
        return {
          1: Question.of("has-audio-track", target).map((hasAudioTrack) =>
            expectation(
              hasAudioTrack,
              () => Outcomes.HasDescriptiveAudio,
              () => Outcomes.HasNoDescriptiveAudio
            )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasDescriptiveAudio = Ok.of(
    Diagnostic.of(
      `The \`<video>\` element has an audio track that describes its visual
      information`
    )
  );

  export const HasNoDescriptiveAudio = Err.of(
    Diagnostic.of(
      `The \`<video>\` element does not have an audio track that describes its
      visual information`
    )
  );
}
