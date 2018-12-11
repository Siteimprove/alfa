import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R19 } from "../../src/sia-r19/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R19 passes when element has a valid value that corresponds to a non-abstract aria role", t => {
  const div = (
    <div
      aria-relevant="text removals"
      aria-required="false"
      aria-hidden="undefined"
      aria-checked="mixed"
      aria-orientation="vertical"
      aria-posinset="40"
      aria-valuemax="100"
    />
  );
  const document = documentFromNodes([div]);

  outcome(
    t,
    SIA_R19,
    { document },
    {
      passed: [
        div.attributes[0],
        div.attributes[1],
        div.attributes[2],
        div.attributes[3],
        div.attributes[4],
        div.attributes[5],
        div.attributes[6]
      ]
    }
  );
});

test("SIA-R19 fails when element has invalid aria attributes", t => {
  const div = <div role="main" aria-live="nope" />;
  const document = documentFromNodes([div]);

  outcome(t, SIA_R19, { document }, { failed: [div.attributes[1]] });
});

test("SIA-R19 is inapplicable when an element does not have any aria states or properties", t => {
  const div = <div>Some Content</div>;
  const document = documentFromNodes([div]);

  outcome(t, SIA_R19, { document }, Outcome.Inapplicable);
});
