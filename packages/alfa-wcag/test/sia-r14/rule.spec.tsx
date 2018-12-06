import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R14 } from "../../src/sia-r14/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R14 passes when aria-label matches textual content", t => {
  const div = (
    <div role="link" aria-label="foo ">
      foo
    </div>
  );
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R14,
    { document, device: getDefaultDevice() },
    { passed: [div] }
  );
});

test("SIA-R14 failes when aria-label does not match textual content", t => {
  const div = (
    <div role="link" aria-label="foo">
      bar
    </div>
  );
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R14,
    { document, device: getDefaultDevice() },
    { failed: [div] }
  );
});

test("SIA-R14 is inapplicable when element is not a widget", t => {
  const a = <a aria-label="foo">bar</a>;
  const document = documentFromNodes([a]);

  outcome(
    t,
    SIA_R14,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
