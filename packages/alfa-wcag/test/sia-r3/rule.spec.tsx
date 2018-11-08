import { audit, Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R4 } from "../../src/sia-r4/rule";

import { aspectsFromNodes } from "../helpers/aspects-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R4 passes when document has a language attribute", t => {
  const html = <html lang="en" />;
  const aspects = aspectsFromNodes([html]);

  outcome(t, audit(aspects, [SIA_R4]), { passed: [html] });
});

test("SIA-R4 failed when document has no language attribute", t => {
  const html = <html />;
  const aspects = aspectsFromNodes([html]);

  outcome(t, audit(aspects, [SIA_R4]), { failed: [html] });
});

test("SIA-R4 is inapplicable when document is not in the HTML namespace", t => {
  const svg = <svg lang="en" />;
  const aspects = aspectsFromNodes([svg]);

  outcome(t, audit(aspects, [SIA_R4]), Outcome.Inapplicable);
});
