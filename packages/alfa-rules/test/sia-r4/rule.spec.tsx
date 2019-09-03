import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R4 } from "../../src/sia-r4/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("Passes when document has a language attribute", t => {
  const html = <html lang="en" />;
  const document = documentFromNodes([html]);

  outcome(t, SIA_R4, { document }, { passed: [html] });
});

test("Failes when document has no language attribute", t => {
  const html = <html />;
  const document = documentFromNodes([html]);

  outcome(t, SIA_R4, { document }, { failed: [html] });
});

test("Is inapplicable when document is not in the HTML namespace", t => {
  const svg = <svg lang="en" />;
  const document = documentFromNodes([svg]);

  outcome(t, SIA_R4, { document }, Outcome.Inapplicable);
});
