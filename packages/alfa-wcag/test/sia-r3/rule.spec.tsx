import { audit } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R3 } from "../../src/sia-r3/rule";

import { aspectsFromNodes } from "../helpers/aspects-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R3 passes when all id attributes are unique", t => {
  const span = <span id="foo" />;
  const div = <div id="bar" />;
  const aspects = aspectsFromNodes([span, div]);

  outcome(t, audit(aspects, [SIA_R3]), { passed: [span, div] });
});

test("SIA-R3 fails when not all id attributes are unique", t => {
  const span = <span id="foo" />;
  const div = <div id="foo" />;
  const aspects = aspectsFromNodes([span, div]);

  outcome(t, audit(aspects, [SIA_R3]), { failed: [span, div] });
});

test("SIA-R3 is inapplicable when no id attributes are present", t => {
  const span = <span class="foo" />;
  const div = <div class="foo" />;
  const aspects = aspectsFromNodes([span, div]);

  outcome(t, audit(aspects, [SIA_R3]), { inapplicable: [span, div] });
});
