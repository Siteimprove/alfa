import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R85, { Outcomes } from "../../src/sia-r85/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a paragraph whose text is not italic", async (t) => {
  const target = <p>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R85, { document }), [
    passed(R85, target, {
      1: Outcomes.IsNotItalic,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is italic", async (t) => {
  const target = <p style={{ fontStyle: "italic" }}>Hello world</p>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R85, { document }), [
    failed(R85, target, {
      1: Outcomes.IsItalic,
    }),
  ]);
});

test("evaluate() fails a paragraph whose text is italic by inheritance", async (t) => {
  const target = <p>Hello world</p>;

  const document = h.document([
    <div style={{ fontStyle: "italic" }}>{target}</div>,
  ]);

  t.deepEqual(await evaluate(R85, { document }), [
    failed(R85, target, {
      1: Outcomes.IsItalic,
    }),
  ]);
});

test("evaluate() fails an ARIA paragraph whose text is italic", async (t) => {
  const target = (
    <div role="paragraph" style={{ fontStyle: "italic" }}>
      Hello world
    </div>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R85, { document }), [
    failed(R85, target, {
      1: Outcomes.IsItalic,
    }),
  ]);
});

test("evaluate() ignores a <p> element whose role was changed", async (t) => {
  const target = (
    <p role="generic" style={{ fontStyle: "italic" }}>
      Hello world
    </p>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R85, { document }), [inapplicable(R85)]);
});
