import { Rule } from "@siteimprove/alfa-act";
import type { Text } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import type { Question } from "../common/act/question.js";
import { nonDisabledTexts } from "../common/applicability/non-disabled-texts.js";

import { hasSufficientContrastDeprecated } from "../common/expectation/contrast.js";

import { Scope, Stability } from "../tags/index.js";

/**
 * @deprecated Use SIA-R69 version 2 instead
 */
export default Rule.Atomic.of<Page, Text, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r69",
  requirements: [Criterion.of("1.4.3"), Criterion.of("1.4.6")],
  tags: [Scope.Component, Stability.Deprecated],
  evaluate({ device, document }) {
    return {
      applicability() {
        return nonDisabledTexts(document, device);
      },

      expectations(target) {
        return hasSufficientContrastDeprecated(target, device, 3, 4.5);
      },
    };
  },
});
