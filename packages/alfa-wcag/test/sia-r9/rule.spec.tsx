import { audit, Outcome } from "@siteimprove/alfa-act";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";

import { SIA_R9 } from "../../src/sia-r9/rule";

import { aspectsFromNodes } from "../helpers/aspects-from-nodes";
import { outcome } from "../helpers/outcome";

test("SIA-R9 passes when meta refresh has no delay", t => {
  const refresh = (
    <meta http-equiv="refresh" content="0; URL='https://foo.far/baz.html'" />
  );
  const aspects = aspectsFromNodes([refresh]);

  outcome(t, audit(aspects, [SIA_R9]), { passed: [refresh] });
});

test("SIA-R9 passes when meta refresh has delay over 72000", t => {
  const refresh = (
    <meta
      http-equiv="refresh"
      content="72001; URL='https://foo.far/baz.html'"
    />
  );
  const aspects = aspectsFromNodes([refresh]);

  outcome(t, audit(aspects, [SIA_R9]), { passed: [refresh] });
});

test("SIA-R9 fails when meta refresh has delay", t => {
  const refresh = (
    <meta http-equiv="refresh" content="10; URL='https://foo.far/baz.html'" />
  );
  const aspects = aspectsFromNodes([refresh]);

  outcome(t, audit(aspects, [SIA_R9]), { failed: [refresh] });
});

test("SIA-R9 is inapplicate if the element is not a meta refresh", t => {
  const refresh = <meta charset="UTF-8" />;
  const aspects = aspectsFromNodes([refresh]);

  outcome(t, audit(aspects, [SIA_R9]), Outcome.Inapplicable);
});
