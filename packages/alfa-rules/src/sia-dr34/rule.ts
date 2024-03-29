import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { videoDescriptionTrackAccurate } from "../common/expectation/video-description-track-accurate";

import { Question } from "../common/act/question";

import { Scope, Stability } from "../tags";

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
