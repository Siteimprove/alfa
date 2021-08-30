import { Rule } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r76",
  requirements: [Criterion.of("1.3.1")],
  evaluate({ device, document }) {
    return {
      applicability() {},
      expectations(target) {},
    };
  },
});
