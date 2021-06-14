import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R72, { Outcomes } from "../../src/sia-r72/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a paragraph whose text is not uppercased", async (t) => {
  const target = <p>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R72, { document }), [
    passed(R72, target, {
      1: Outcomes.IsNotUppercased,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is uppercased", async (t) => {
  const target = <p style={{ textTransform: "uppercase" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R72, { document }), [
    failed(R72, target, {
      1: Outcomes.IsUppercased,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is uppercased by inheritance", async (t) => {
  const target = <p>Hello world</p>;

  const document = h.document([
    <div style={{ textTransform: "uppercase" }}>{target}</div>,
  ]);

  t.deepEqual(await evaluate(R72, { document }), [
    failed(R72, target, {
      1: Outcomes.IsUppercased,
    }),
  ]);
});

test("evaluate() fails an ARIA paragraph whose text is uppercased", async (t) => {
  const target = (
    <div role="paragraph" style={{ textTransform: "uppercase" }}>
      Hello world
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R72, { document }), [
    failed(R72, target, {
      1: Outcomes.IsUppercased,
    }),
  ]);
});

test("evaluate() ignores a <p> whose role is changed", async (t) => {
  const target = (
    <p role="generic" style={{ textTransform: "uppercase" }}>
      Hello world
    </p>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R72, { document }), [inapplicable(R72)]);
});
