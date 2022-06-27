import { Declaration, h, Node } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import R75, { Outcomes } from "../../src/sia-r75/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const fontSize = (value: string) => Declaration.of("font-size", value);
const makeTarget = (
  name: string,
  children: Array<string | Node>,
  declaration: Declaration
) => h.element(name, [], children, [declaration]);

test("evaluate() passes an element with a font size not smaller than 9 pixels", async (t) => {
  const declaration = fontSize("medium");
  const target = makeTarget("html", ["Hello World"], declaration);

  const document = h.document([target]);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target, {
      1: Outcomes.IsSufficient(Option.of(declaration)),
    }),
  ]);
});

test("evaluate() fails an element with a font size smaller than 9 pixels", async (t) => {
  const declaration = fontSize("8px");
  const target = makeTarget("div", ["Hello World"], declaration);

  const document = h.document([target]);

  t.deepEqual(await evaluate(R75, { document }), [
    failed(R75, target, {
      1: Outcomes.IsInsufficient(Option.of(declaration)),
    }),
  ]);
});

test(`evaluate() fails an element with an accumulated font size smaller than 9
      pixels`, async (t) => {
  const declaration1 = fontSize("smaller");
  const target1 = makeTarget("p", ["Hello World"], declaration1);

  const declaration2 = fontSize("10px");
  const target2 = makeTarget("div", [target1], declaration2);

  const document = h.document([target2]);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target2, {
      1: Outcomes.IsSufficient(Option.of(declaration2)),
    }),
    failed(R75, target1, {
      1: Outcomes.IsInsufficient(Option.of(declaration1)),
    }),
  ]);
});

test(`evaluate() passes an element with too small a font size when the font size
      does not affect descendant text`, async (t) => {
  const declaration1 = fontSize("16px");
  const target1 = makeTarget("p", ["Hello World"], declaration1);

  const declaration2 = fontSize("8px");
  const target2 = makeTarget("div", [target1, h.text(" ")], declaration2);

  const document = h.document([target2]);

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, target2, {
      1: Outcomes.IsSufficient(Option.of(declaration2)),
    }),
    passed(R75, target1, {
      1: Outcomes.IsSufficient(Option.of(declaration1)),
    }),
  ]);
});

test(`evaluate() does not collide similar \`font-size\` declarations`, async (t) => {
  const bad = <span class="bad">World</span>;
  const problem = <div class="problem">{bad}</div>;
  const good = <div class="good">Hello {problem}</div>;

  const declarationGood = fontSize("100%");
  const declarationBad = fontSize("100%");
  const declarationProblem = fontSize("1px");
  const document = h.document(
    [good],
    [
      h.sheet([
        h.rule.style(".good", [declarationGood]),
        h.rule.style(".bad", [declarationBad]),
        h.rule.style(".problem", [declarationProblem]),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, good, { 1: Outcomes.IsSufficient(Option.of(declarationGood)) }),
    passed(R75, problem, {
      1: Outcomes.IsSufficient(Option.of(declarationProblem)),
    }),
    failed(R75, bad, { 1: Outcomes.IsInsufficient(Option.of(declarationBad)) }),
  ]);
});

test(`evaluate() does not collide same \`font-size\` declarations`, async (t) => {
  const bad = <span class="bad">World</span>;
  const problem = <div class="problem">{bad}</div>;
  const good = <div class="good">Hello {problem}</div>;

  const declarationBadGood = fontSize("100%");
  const declarationProblem = fontSize("1px");
  const document = h.document(
    [good],
    [
      h.sheet([
        h.rule.style(".bad, .good", [declarationBadGood]),
        h.rule.style(".problem", [declarationProblem]),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R75, { document }), [
    passed(R75, good, {
      1: Outcomes.IsSufficient(Option.of(declarationBadGood)),
    }),
    passed(R75, problem, {
      1: Outcomes.IsSufficient(Option.of(declarationProblem)),
    }),
    failed(R75, bad, {
      1: Outcomes.IsInsufficient(Option.of(declarationBadGood)),
    }),
  ]);
});

test("evaluate() is inapplicable to a <sup> element", async (t) => {
  const target = (
    <a href="#">
      <sup>Link</sup>
    </a>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R75, { document }), [inapplicable(R75)]);
});
