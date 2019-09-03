import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R10 } from "../../src/sia-r10/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when autocomplete is set to a known term", t => {
  const input = <input autocomplete="username" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R10,
    { document, device: getDefaultDevice() },
    { passed: [input.attributes[0]] }
  );
});

test("Fails when autocomplete is not set to a known term", t => {
  const input = <input autocomplete="batman" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R10,
    { document, device: getDefaultDevice() },
    { failed: [input.attributes[0]] }
  );
});

test("Is inapplicable when no autocomplete attribute is present", t => {
  const input = <input type="text" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R10,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});

test("Is inapplicable when element is not a widget", t => {
  const input = <input autocomplete="username" tabindex="-1" role="none" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R10,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
