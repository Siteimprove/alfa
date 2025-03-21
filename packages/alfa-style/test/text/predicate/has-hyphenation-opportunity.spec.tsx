import { Device } from "@siteimprove/alfa-device";
import { h, Text } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { hasHyphenationOpportunity } from "../../../src/text/predicate/has-hyphenation-opportunity.js";

const device = Device.standard();

test("hasHyphenationOpportunity() returns false for `hyphens: none`", (t) => {
  const shy = <span>Hel&shy;lo</span>;
  const hyphen = <span>Hel-lo</span>;
  const text = <span>Hello</span>;

  h.document(
    [shy, hyphen, text],
    [h.sheet([h.rule.style("span", { hyphens: "none" })])],
  );

  for (const target of [shy, hyphen, text].map((element) =>
    element.children().first().getUnsafe(),
  )) {
    t(!hasHyphenationOpportunity(device)(target as Text));
  }
});

test("hasHyphenationOpportunity() returns true for `hyphens: auto`", (t) => {
  const shy = <span>Hel&shy;lo</span>;
  const hyphen = <span>Hel-lo</span>;
  const text = <span>Hello</span>;

  h.document(
    [shy, hyphen, text],
    [h.sheet([h.rule.style("span", { hyphens: "auto" })])],
  );

  for (const target of [shy, hyphen, text].map((element) =>
    element.children().first().getUnsafe(),
  )) {
    t(hasHyphenationOpportunity(device)(target as Text));
  }
});

test("hasHyphenationOpportunity() returns true on soft hyphens for `hyphens: manual`", (t) => {
  const shy = <span>Hel&shy;lo</span>;
  const hyphen = <span>Hel-lo</span>;
  const text = <span>Hello</span>;

  h.document(
    [shy, hyphen, text],
    [h.sheet([h.rule.style("span", { hyphens: "manual" })])],
  );

  const targets = [shy, hyphen, text].map((element) =>
    element.children().first().getUnsafe(),
  ) as Array<Text>;

  t(hasHyphenationOpportunity(device)(targets[0]));
  t(!hasHyphenationOpportunity(device)(targets[1]));
  t(!hasHyphenationOpportunity(device)(targets[2]));
});
