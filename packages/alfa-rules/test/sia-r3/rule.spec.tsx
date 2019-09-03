import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R3 } from "../../src/sia-r3/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when all id attributes are unique", t => {
  const span = <span id="foo" />;
  const div = <div id="bar" />;
  const document = documentFromNodes([span, div]);

  outcome(t, SIA_R3, { document }, { passed: [span, div] });
});

test("Fails when not all id attributes are unique", t => {
  const span = <span id="foo" />;
  const div = <div id="foo" />;
  const document = documentFromNodes([span, div]);

  outcome(t, SIA_R3, { document }, { failed: [span, div] });
});

test("Is inapplicable when no id attributes are present", t => {
  const span = <span class="foo" />;
  const document = documentFromNodes([span]);

  outcome(t, SIA_R3, { document }, Outcome.Inapplicable);
});
