import { Rule } from "@siteimprove/alfa-act";
import type { Element } from "@siteimprove/alfa-dom";
import { Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video.ts";

import { videoDescriptionTrackAccurate } from "../common/expectation/video-description-track-accurate.ts";

import type { Question } from "../common/act/question.ts";

import { Scope, Stability } from "../tags/index.ts";

/**
 * This rule has been deprecated and should not be used anymore.
 *
 * @deprecated
 */
export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r34",
  requirements: [Technique.of("H96")],
  tags: [Scope.Component, Stability.Deprecated],
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, {
          audio: { has: false },
          track: { has: true, kind: "descriptions" },
        });
      },

      expectations(target) {
        return videoDescriptionTrackAccurate(target);
      },
    };
  },
});
