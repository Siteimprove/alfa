import { audit, Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R8 } from "../../src/sia-r8/rule";

import { aspectsFromNodes } from "../helpers/aspects-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R8 passes when a input has an accessible name", t => {
  const input = <input type="radio" aria-label="foo" />;
  const aspects = aspectsFromNodes([input]);

  outcome(t, audit(aspects, [SIA_R8]), { passed: [input] });
});

test("SIA-R8 fails when a input has no accessible name", t => {
  const input = <input type="radio" />;
  const aspects = aspectsFromNodes([input]);

  outcome(t, audit(aspects, [SIA_R8]), { failed: [input] });
});

test("SIA-R8 is inapplicable when element does not have a specific role", t => {
  const input = <input />;
  const aspects = aspectsFromNodes([input]);

  outcome(t, audit(aspects, [SIA_R8]), Outcome.Inapplicable);
});
