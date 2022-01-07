import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";

import { audio } from "../common/applicability/audio";

import { audioTextAlternative } from "../common/expectation/media-text-alternative";

import { Question } from "../common/question";
import { Scope } from "../tags";

export default Rule.Atomic.of<Page, Element, Question.Type>({
  uri: "https://alfa.siteimprove.com/rules/sia-r29",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return audio(document, device);
      },

      expectations(target) {
        return audioTextAlternative(target, device);
      },
    };
  },
});
