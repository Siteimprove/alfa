import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r32.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: false } });
      },

      expectations(target) {
        return {
          1: Question.of(
            "has-audio-track",
            "boolean",
            target,
            "Does the <video> element have an audio track that describes its visual information?"
          ).map(hasAudioTrack =>
            hasAudioTrack
              ? Ok.of(
                  "The <video> element has an audio track that describes its visual information"
                )
              : Err.of(
                  "The <video> element does not have an audio track that describes its visual information"
                )
          )
        };
      }
    };
  }
});
