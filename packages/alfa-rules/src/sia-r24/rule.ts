import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";
import { videoTranscript } from "../common/expectation/media-transcript";
import { Question } from "../common/act/question";

import { Scope } from "../tags";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r24",
  requirements: [Criterion.of("1.2.8"), Technique.of("G69")],
  tags: [Scope.Component],
  evaluate: ({ device, document }) => {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        return videoTranscript(target, device);
      },
    };
  },
});
