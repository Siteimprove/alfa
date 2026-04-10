import { Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video.ts";

import { videoDescriptionTrackAccurate } from "../common/expectation/video-description-track-accurate.ts";

import type { Question } from "../common/act/question.ts";

import { Scope, Stability } from "../tags/index.ts";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r36",
  requirements: [Technique.of("G78"), Technique.of("H96")],
  tags: [Scope.Component, Stability.Deprecated],
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, {
          audio: { has: true },
          track: { has: true, kind: "descriptions" },
        });
      },

      expectations(target) {
        return videoDescriptionTrackAccurate(target);
      },
    };
  },
});
