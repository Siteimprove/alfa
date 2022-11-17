import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { textWithInlinedImportantProperty } from "../common/applicability/text-with-inlined-important-property";
import { isWideEnough } from "../common/expectation/is-wide-enough";

import { Scope, Version } from "../tags";

const property = "letter-spacing";
const threshold = 0.12;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r91",
  requirements: [Criterion.of("1.4.12")],
  tags: [Scope.Component, Version.of(2)],
  evaluate({ device, document }) {
    return {
      applicability() {
        return textWithInlinedImportantProperty(document, device, property);
      },

      expectations(target) {
        return isWideEnough(target, device, property, threshold);
      },
    };
  },
});
