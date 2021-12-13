import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R75, { Outcomes } from "../../src/sia-r75/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed } from "../common/outcome";

test("evaluate() passes an element with a font size not smaller than 9 pixels", async (t) => {
  const target = <html style={{ fontSize: "medium" }}>Hello world</html>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test("evaluate() fails an element with a font size smaller than 9 pixels", async (t) => {
  const target = <div style={{ fontSize: "8px" }}>Hello world</div>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R75, { document }), [
    failed(R75, target, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test(`evaluate() fails an element with an accumulated font size smaller than 9
      pixels`, async (t) => {
  const target1 = <p style={{ fontSize: "smaller" }}>Hello world</p>;
  const target2 = <div style={{ fontSize: "10px" }}>{target1}</div>;

  const document = h.document([target2]);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target2, {
      1: Outcomes.IsSufficient,
    }),
    failed(R75, target1, {
      1: Outcomes.IsInsufficient,
    }),
  ]);
});

test(`evaluate() passes an element with too small a font size when the font size
      does not affect descendant text`, async (t) => {
  const target1 = <p style={{ fontSize: "16px" }}>Hello world</p>;

  const target2 = (
    <div style={{ fontSize: "8px" }}>
      {target1} {/* Significant whitespace */}
    </div>
  );

  const document = h.document([target2]);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target2, {
      1: Outcomes.IsSufficient,
    }),
    passed(R75, target1, {
      1: Outcomes.IsSufficient,
    }),
  ]);
});

test(`evaluate() does not collide similar \`font-size\` declarations`, async (t) => {
  const bad = <span class="bad">World</span>;
  const problem = <div class="problem">{bad}</div>;
  const good = <div class="good">Hello {problem}</div>;

  const document = h.document(
    [good],
    [
      h.sheet([
        h.rule.style(".good", { fontSize: "100%" }),
        h.rule.style(".bad", { fontSize: "100%" }),
        h.rule.style(".problem", { fontSize: "1px" }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, good, { 1: Outcomes.IsSufficient }),
    passed(R75, problem, { 1: Outcomes.IsSufficient }),
    failed(R75, bad, { 1: Outcomes.IsInsufficient }),
  ]);
});

test(`evaluate() does not collide same \`font-size\` declarations`, async (t) => {
  const bad = <span class="bad">World</span>;
  const problem = <div class="problem">{bad}</div>;
  const good = <div class="good">Hello {problem}</div>;

  const document = h.document(
    [good],
    [
      h.sheet([
        h.rule.style(".good, .bad", { fontSize: "100%" }),
        h.rule.style(".problem", { fontSize: "1px" }),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, good, { 1: Outcomes.IsSufficient }),
    passed(R75, problem, { 1: Outcomes.IsSufficient }),
    failed(R75, bad, { 1: Outcomes.IsInsufficient }),
  ]);
});
