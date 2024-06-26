import { Rule } from "@siteimprove/alfa-act";
import { Text } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { Question } from "../common/act/question.js";
import { nonDisabledTexts } from "../common/applicability/non-disabled-texts.js";

import { hasSufficientContrastDeprecated } from "../common/expectation/contrast.js";

import { Scope, Stability } from "../tags/index.js";

/**
 * @deprecated Use SIA-R66 version 2 instead
 */
export default Rule.Atomic.of<Page, Text, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r66",
  requirements: [Criterion.of("1.4.6")],
  tags: [Scope.Component, Stability.Deprecated],
  evaluate({ device, document }) {
    return {
      applicability() {
        return nonDisabledTexts(document, device);
      },

      expectations(target) {
        return hasSufficientContrastDeprecated(target, device, 4.5, 7);
      },
    };
  },
});
