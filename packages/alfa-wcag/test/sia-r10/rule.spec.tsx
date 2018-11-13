import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R10 } from "../../src/sia-r10/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R10 passes when autocomplete is set to a known term", t => {
  const input = <input autocomplete="username" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R10, { document }, { passed: [input.attributes[0]] });
});

test("SIA-R10 fails when autocomplete is not set to a known term", t => {
  const input = <input autocomplete="batman" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R10, { document }, { failed: [input.attributes[0]] });
});

test("SIA-R10 is inapplicable when no autocomplete attribute is present", t => {
  const input = <input type="text" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R10, { document }, Outcome.Inapplicable);
});

test("SIA-R10 is inapplicable when element is not a widget", t => {
  const input = <input autocomplete="username" tabindex="-1" role="none" />;
  const document = documentFromNodes([input]);

  outcome(t, SIA_R10, { document }, Outcome.Inapplicable);
});
