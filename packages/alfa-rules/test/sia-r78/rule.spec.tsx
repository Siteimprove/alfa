import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R78, { Outcomes } from "../../src/sia-r78/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluates() passes headings with content`, async (t) => {
  const part1 = <h1>Part one</h1>;
  const chap11 = <h2>Chapter one</h2>;
  const sec111 = <h3>Section 1</h3>;
  const part2 = <h1>Part two</h1>;
  const chap21 = <h2>Chapter one</h2>;
  const chap22 = <h2>Chapter two</h2>;
  const sec221 = <h3>Section one</h3>;

  const document = h.document([
    part1,
    chap11,
    sec111,
    "content",
    part2,
    chap21,
    "content",
    chap22,
    sec221,
    "content",
  ]);

  t.deepEqual(await evaluate(R78, { document }), [
    passed(R78, part1, { 1: Outcomes.hasContent }),
    passed(R78, chap11, { 1: Outcomes.hasContent }),
    passed(R78, sec111, { 1: Outcomes.hasContent }),
    passed(R78, part2, { 1: Outcomes.hasContent }),
    passed(R78, chap21, { 1: Outcomes.hasContent }),
    passed(R78, chap22, { 1: Outcomes.hasContent }),
    passed(R78, sec221, { 1: Outcomes.hasContent }),
  ]);
});

test(`evaluate() fails headings with no content`, async (t) => {
  const part1 = <h1>Part one</h1>;
  const part2 = <h1>Part two</h1>;
  const chap21 = <h2>Chapter one</h2>;
  const part3 = <h1>Part three</h1>;
  const chap31 = <h2>Chapter one</h2>;
  const chap32 = <h2>Chapter two</h2>;
  const sec321 = <h3>Section one</h3>;

  const document = h.document([
    part1,
    part2,
    chap21,
    part3,
    chap31,
    chap32,
    sec321,
  ]);

  t.deepEqual(await evaluate(R78, { document }), [
    failed(R78, part1, { 1: Outcomes.hasNoContent }),
    passed(R78, part2, { 1: Outcomes.hasContent }),
    failed(R78, chap21, { 1: Outcomes.hasNoContent }),
    passed(R78, part3, { 1: Outcomes.hasContent }),
    failed(R78, chap31, { 1: Outcomes.hasNoContent }),
    passed(R78, chap32, { 1: Outcomes.hasContent }),
    failed(R78, sec321, { 1: Outcomes.hasNoContent }),
  ]);
});

test(`evaluate() is inapplicable when there is no headings`, async (t) => {
  const document = h.document([<div></div>]);

  t.deepEqual(await evaluate(R78, { document }), [inapplicable(R78)]);
});

test(`evaluate() ignores headings not in the accessibility tree`, async (t) => {
  const document = h.document([
    <div>
      <h1 aria-hidden="true">Hidden</h1>
    </div>,
  ]);

  t.deepEqual(await evaluate(R78, { document }), [inapplicable(R78)]);
});
