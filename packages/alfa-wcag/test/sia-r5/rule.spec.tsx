import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R5 } from "../../src/sia-r5/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R5 passes when document has a valid language attributes", t => {
  const html = <html lang="en" />;
  const document = documentFromNodes([html]);

  outcome(t, SIA_R5, { document }, { passed: [html.attributes[0]] });
});

test("SIA-R5 fails when document has no valid language attributes", t => {
  const html = <html lang="foo" />;
  const document = documentFromNodes([html]);

  outcome(t, SIA_R5, { document }, { failed: [html.attributes[0]] });
});

test("SIA-R5 fails when document has no language attributes", t => {
  const html = <html foo="bar" />;
  const document = documentFromNodes([html]);

  outcome(t, SIA_R5, { document }, Outcome.Inapplicable);
});
