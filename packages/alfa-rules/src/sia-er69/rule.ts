import { Rule } from "@siteimprove/alfa-act";
import { Text } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { Question } from "../common/act/question";
import { nonDisabledTexts } from "../common/applicability/non-disabled-texts";

import { hasSufficientContrastExperimental } from "../common/expectation/contrast";

import { Scope, Version } from "../tags";

export default Rule.Atomic.of<Page, Text, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r69",
  requirements: [Criterion.of("1.4.3"), Criterion.of("1.4.6")],
  tags: [Scope.Component, Version.of(2)],
  evaluate({ device, document }) {
    return {
      applicability() {
        return nonDisabledTexts(document, device);
      },

      expectations(target) {
        return hasSufficientContrastExperimental(target, device, 3, 4.5);
      },
    };
  },
});
