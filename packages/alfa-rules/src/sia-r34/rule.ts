import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";
import { videoDescriptionTrackAccurate } from "../common/expectations/video-description-track-accurate";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r34.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, {
          audio: { has: false },
          track: { has: true, kind: "descriptions" }
        });
      },

      expectations(target) {
        return videoDescriptionTrackAccurate(target);
      }
    };
  }
});
