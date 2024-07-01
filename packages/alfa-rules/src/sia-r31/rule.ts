import { Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import type { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video.js";

import { videoTextAlternative } from "../common/expectation/media-text-alternative.js";

import type { Question } from "../common/act/question.js";

import { Scope, Stability } from "../tags/index.js";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r31",
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: true } });
      },

      expectations(target) {
        return videoTextAlternative(target, device);
      },
    };
  },
});
