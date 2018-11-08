import { audit, Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R5 } from "../../src/sia-r5/rule";

import { aspectsFromNodes } from "../helpers/aspects-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R5 passes when document has a valid language attributes", t => {
  const html = <html lang="en" />;
  const aspects = aspectsFromNodes([html]);

  outcome(t, audit(aspects, [SIA_R5]), { passed: [html.attributes[0]] });
});

test("SIA-R5 fails when document has no valid language attributes", t => {
  const html = <html lang="foo" />;
  const aspects = aspectsFromNodes([html]);

  outcome(t, audit(aspects, [SIA_R5]), { failed: [html.attributes[0]] });
});

test("SIA-R5 fails when document has no language attributes", t => {
  const html = <html foo="bar" />;
  const aspects = aspectsFromNodes([html]);

  outcome(t, audit(aspects, [SIA_R5]), Outcome.Inapplicable);
});
