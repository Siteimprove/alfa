import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R39, { Outcomes } from "../../src/sia-r39/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes images whose name is descriptive", async (t) => {
  const target = <img src="Placeholder" alt="Placeholder" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R39,
      { document },
      oracle({ "name-describes-purpose": true })
    ),
    [
      passed(
        R39,
        target,
        { 1: Outcomes.NameIsDescriptive("img") },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() passes images whose name is not descriptive", async (t) => {
  const target = <img src="foo.jpg" alt="foo.jpg" />;

  const document = h.document([target]);

  t.deepEqual(
    await evaluate(
      R39,
      { document },
      oracle({ "name-describes-purpose": false })
    ),
    [
      failed(
        R39,
        target,
        { 1: Outcomes.NameIsNotDescriptive("img") },
        Outcome.Mode.SemiAuto
      ),
    ]
  );
});

test("evaluate() is inapplicable when there is no image", async (t) => {
  const document = h.document([<div>Hello</div>]);

  t.deepEqual(await evaluate(R39, { document }), [inapplicable(R39)]);
});

test("evaluate() is inapplicable to images whose name differ from source", async (t) => {
  const target = <img src="foo.jpg" alt="Placeholder" />;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R39, { document }), [inapplicable(R39)]);
});
