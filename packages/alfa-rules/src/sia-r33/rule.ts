import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video.js";
import { videoTranscript } from "../common/expectation/media-transcript.js";
import { Question } from "../common/act/question.js";

import { Scope, Stability } from "../tags/index.js";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r33",
  requirements: [Technique.of("G159")],
  tags: [Scope.Component, Stability.Stable],
  evaluate: ({ device, document }) => {
    return {
      applicability() {
        return video(document, device, { audio: { has: false } });
      },

      expectations(target) {
        return videoTranscript(target, device);
      },
    };
  },
});
