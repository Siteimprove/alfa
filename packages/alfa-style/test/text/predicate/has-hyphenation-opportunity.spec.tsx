import { Device } from "@siteimprove/alfa-device";
import { type Element, h, Text } from "@siteimprove/alfa-dom";
import { type Assertions, test } from "@siteimprove/alfa-test";
import type { Style } from "../../../src/index.js";

import { hasHyphenationOpportunity } from "../../../src/text/predicate/has-hyphenation-opportunity.js";

const device = Device.standard();

function getHyphenationOpportunity(element: Element): boolean {
  return hasHyphenationOpportunity(device)(
    element.children().first().getUnsafe() as Text,
  );
}

function hyphenationTest(
  hyphens: Style.Computed<"hyphens">["value"],
  expected: { shy: boolean; hyphen: boolean; text: boolean },
): (t: Assertions) => void {
  return (t) => {
    const shy = <span>Hel&shy;lo</span>;
    const hyphen = <span>Hel-lo</span>;
    const text = <span>Hello</span>;

    h.document(
      [shy, hyphen, text],
      [h.sheet([h.rule.style("span", { hyphens })])],
    );

    t.equal(getHyphenationOpportunity(shy), expected.shy);
    t.equal(getHyphenationOpportunity(hyphen), expected.hyphen);
    t.equal(getHyphenationOpportunity(text), expected.text);
  };
}

test(
  "hasHyphenationOpportunity() returns false for `hyphens: none`",
  hyphenationTest("none", { shy: false, hyphen: false, text: false }),
);

test(
  "hasHyphenationOpportunity() returns true for `hyphens: auto`",
  hyphenationTest("auto", { shy: true, hyphen: true, text: true }),
);

test(
  "hasHyphenationOpportunity() returns true on soft hyphens for `hyphens: manual`",
  hyphenationTest("manual", { shy: true, hyphen: false, text: false }),
);
