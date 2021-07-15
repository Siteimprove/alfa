import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";

import { video } from "../common/applicability/video";

import { videoTextAlternative } from "../common/expectation/media-text-alternative";

import { Question } from "../common/question";

export default Rule.Atomic.of<Page, Element, Question, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r26",
  evaluate({ device, document }) {
    return {
      applicability() {
        return video(document, device, { audio: { has: false } });
      },

      expectations(target) {
        return videoTextAlternative(target, device);
      },
    };
  },
});
