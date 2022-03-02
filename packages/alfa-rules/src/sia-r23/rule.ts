import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Page } from "@siteimprove/alfa-web";

import { audio } from "../common/applicability/audio";
import { audioTranscript } from "../common/expectation/media-transcript";
import { Question } from "../common/act/question";

import { Scope } from "../tags";

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r23",
  tags: [Scope.Component],
  evaluate({ document, device }) {
    return {
      applicability() {
        return audio(document, device);
      },

      expectations(target) {
        return audioTranscript(target, device);
      },
    };
  },
});
