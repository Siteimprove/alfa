import { Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R21 } from "../../src/sia-r21/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when role attributes have valid values", t => {
  const img = <img role="presentation xyz" src="" />;
  const document = documentFromNodes([img]);

  outcome(
    t,
    SIA_R21,
    { document, device: getDefaultDevice() },
    {
      passed: [img.attributes[0]]
    }
  );
});

test("Fails when role attributes have invalid values", t => {
  const input = <input type="text" role="invalid role" />;
  const document = documentFromNodes([input]);

  outcome(
    t,
    SIA_R21,
    { document, device: getDefaultDevice() },
    {
      failed: [input.attributes[1]]
    }
  );
});

test("Is inapplicable when element does not have role attribute.", t => {
  const div = <div>Some Content</div>;
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R21,
    { document, device: getDefaultDevice() },
    Outcome.Inapplicable
  );
});
