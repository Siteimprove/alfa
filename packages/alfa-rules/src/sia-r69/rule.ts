import { Rule } from "@siteimprove/alfa-act";
import { Element, Text } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { Group } from "../common/act/group.js";
import { Question } from "../common/act/question.js";
import { nonDisabledTexts } from "../common/applicability/non-disabled-texts.js";

import { hasSufficientContrast } from "../common/expectation/contrast.js";

import { Scope, Stability, Version } from "../tags/index.js";

export default Rule.Atomic.of<
  Page,
  Text,
  Question.Metadata,
  Text | Group<Element>
>({
  uri: "https://alfa.siteimprove.com/rules/sia-r69",
  requirements: [Criterion.of("1.4.3"), Criterion.of("1.4.6")],
  tags: [Scope.Component, Stability.Stable, Version.of(2)],
  evaluate({ device, document }) {
    return {
      applicability() {
        return nonDisabledTexts(document, device).reject(isOnlyPunctuation);
      },

      expectations(target) {
        return hasSufficientContrast(target, device, 3, 4.5);
      },
    };
  },
});

function isOnlyPunctuation(text: Text): boolean {
  return /^[\p{P}\p{S}\p{Cf}]+$/gu.test(text.data);
}
