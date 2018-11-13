import { Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R7 } from "../../src/sia-r7/rule";

import { documentFromNodes } from "../helpers/document-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R7 passes when body has a valid language attributes", t => {
  const body = <body lang="en" />;
  const document = documentFromNodes([<html>{body}</html>]);

  outcome(t, SIA_R7, { document }, { passed: [body.attributes[0]] });
});

test("SIA-R7 fails when body has no valid language attributes", t => {
  const body = <body lang="foo" />;
  const document = documentFromNodes([<html>{body}</html>]);

  outcome(t, SIA_R7, { document }, { failed: [body.attributes[0]] });
});

test("SIA-R7 fails when body has no language attributes", t => {
  const body = <body foo="bar" />;
  const document = documentFromNodes([<html>{body}</html>]);

  outcome(t, SIA_R7, { document }, Outcome.Inapplicable);
});
