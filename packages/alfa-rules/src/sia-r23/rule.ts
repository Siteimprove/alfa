import { Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import type { Element } from "@siteimprove/alfa-dom";
import type { Page } from "@siteimprove/alfa-web";

import { audio } from "../common/applicability/audio.js";
import { audioTranscript } from "../common/expectation/media-transcript.js";
import type { Question } from "../common/act/question.js";

import { Scope, Stability } from "../tags/index.js";

const { isPerceivableForAll } = DOM;

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r23",
  tags: [Scope.Component, Stability.Stable],
  evaluate({ document, device }) {
    return {
      applicability() {
        return audio(document, device);
      },

      expectations(target) {
        return audioTranscript(target, isPerceivableForAll(device));
      },
    };
  },
});
