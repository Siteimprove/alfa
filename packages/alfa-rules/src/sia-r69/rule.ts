import { Rule } from "@siteimprove/alfa-act";
import type { Element, Text } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import { Criterion } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import type { Group } from "../common/act/group.js";
import type { Question } from "../common/act/question.js";
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
  requirements: [Criterion.of("1.4.3"), Criterion.of("1.4.6"), EAA.of("9.1.4.3")],
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
