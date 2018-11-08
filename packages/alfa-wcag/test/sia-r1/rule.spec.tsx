import { audit, Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R1 } from "../../src/sia-r1/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R1 passes when document has a title", t => {
  const document = documentFromNodes([
    <html>
      <head>
        <title>Hello world</title>
      </head>
    </html>
  ]);

  outcome(t, audit({ document }, [SIA_R1]), { passed: [document] });
});

test("SIA-R1 fails when document has no title", t => {
  const document = documentFromNodes([
    <html>
      <head />
    </html>
  ]);

  outcome(t, audit({ document }, [SIA_R1]), { failed: [document] });
});

test("SIA-R1 fails when only other namespace has a title", t => {
  const document = documentFromNodes([
    <html>
      <head>
        <svg>
          <title>Hello World</title>
        </svg>
      </head>
    </html>
  ]);

  outcome(t, audit({ document }, [SIA_R1]), { failed: [document] });
});

test("SIA-R1 only works in the HTML namespace", t => {
  const document = documentFromNodes([
    <svg>
      <title>Hello World</title>
    </svg>
  ]);

  outcome(t, audit({ document }, [SIA_R1]), Outcome.Inapplicable);
});
