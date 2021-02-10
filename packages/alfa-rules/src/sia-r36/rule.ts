import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { videoDescriptionTrackAccurate } from "../common/expectation/video-description-track-accurate";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r36.html",
  requirements: [Technique.of("G78"), Technique.of("H96")],
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
