import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video.js";

import { expectation } from "../common/act/expectation.js";
import { Question } from "../common/act/question.js";

import { Scope, Stability } from "../tags/index.js";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r32",
  requirements: [Technique.of("G166")],
  tags: [Scope.Component, Stability.Stable],
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
              () => Outcomes.HasNoDescriptiveAudio,
            ),
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const HasDescriptiveAudio = Ok.of(
    Diagnostic.of(
      `The \`<video>\` element has an audio track that describes its visual
      information`,
    ),
  );

  export const HasNoDescriptiveAudio = Err.of(
    Diagnostic.of(
      `The \`<video>\` element does not have an audio track that describes its
      visual information`,
    ),
  );
}
