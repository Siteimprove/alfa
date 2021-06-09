import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R71, { Outcomes } from "../../src/sia-r71/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a paragraph whose text is not justified", async (t) => {
  const target = <p>Hello world</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R71, { document }), [
    passed(R71, target, {
      1: Outcomes.IsNotJustified,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is justified", async (t) => {
  const target = <p style={{ textAlign: "justify" }}>Hello world</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R71, { document }), [
    failed(R71, target, {
      1: Outcomes.IsJustified,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is justified by inheritance", async (t) => {
  const target = <p>Hello world</p>;

  const document = Document.of([
    <div style={{ textAlign: "justify" }}>{target}</div>,
  ]);

  t.deepEqual(await evaluate(R71, { document }), [
    failed(R71, target, {
      1: Outcomes.IsJustified,
    }),
  ]);
});

test("evaluate() fails an ARIA paragraph whose text is justified", async (t) => {
  const target = (
    <div role="paragraph" style={{ textAlign: "justify" }}>
      Hello world
    </div>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R71, { document }), [
    failed(R71, target, {
      1: Outcomes.IsJustified,
    }),
  ]);
});

test("evaluate() ignores a <p> element whose role is changed", async (t) => {
  const target = (
    <p role="generic" style={{ textAlign: "justify" }}>
      Hello world
    </p>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R71, { document }), [inapplicable(R71)]);
});
