import { h } from "@siteimprove/alfa-dom";
import { None, Some } from "@siteimprove/alfa-option";
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
    passed(R78, part1, { 1: Outcomes.hasContent(Some.of(part2), 1, 1) }),
    passed(R78, chap11, { 1: Outcomes.hasContent(Some.of(part2), 2, 1) }),
    passed(R78, sec111, { 1: Outcomes.hasContent(Some.of(part2), 3, 1) }),
    passed(R78, part2, { 1: Outcomes.hasContent(None, 1, -1) }),
    passed(R78, chap21, { 1: Outcomes.hasContent(Some.of(chap22), 2, 2) }),
    passed(R78, chap22, { 1: Outcomes.hasContent(None, 2, -1) }),
    passed(R78, sec221, { 1: Outcomes.hasContent(None, 3, -1) }),
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
    failed(R78, part1, { 1: Outcomes.hasNoContent(Some.of(part2), 1, 1) }),
    passed(R78, part2, { 1: Outcomes.hasContent(Some.of(part3), 1, 1) }),
    failed(R78, chap21, { 1: Outcomes.hasNoContent(Some.of(part3), 2, 1) }),
    passed(R78, part3, { 1: Outcomes.hasContent(None, 1, -1) }),
    failed(R78, chap31, { 1: Outcomes.hasNoContent(Some.of(chap32), 2, 2) }),
    passed(R78, chap32, { 1: Outcomes.hasContent(None, 2, -1) }),
    failed(R78, sec321, { 1: Outcomes.hasNoContent(None, 3, -1) }),
  ]);
});

test("evaluates() passes headings with only non-visible content", async (t) => {
  const part1 = <h1>Lorem</h1>;
  const part2 = <h1>Ipsum</h1>;

  const document = h.document([
    part1,
    <div style={{ height: "0px", width: "0px", overflow: "hidden" }}>
      Hello
    </div>,
    part2,
    <div>world</div>,
  ]);

  t.deepEqual(await evaluate(R78, { document }), [
    passed(R78, part1, { 1: Outcomes.hasContent(Some.of(part2), 1, 1) }),
    passed(R78, part2, { 1: Outcomes.hasContent(None, 1, -1) }),
  ]);
});

test("evaluates() fails a heading with only structure before the next heading", async (t) => {
  const part1 = <h1>Hello</h1>;
  const part2 = <h1>Site navigation</h1>;

  const document = h.document([
    part1,
    <nav aria-label="site">
      {part2}
      <a href="#">Foo</a>
    </nav>,
  ]);

  t.deepEqual(await evaluate(R78, { document }), [
    failed(R78, part1, { 1: Outcomes.hasNoContent(Some.of(part2), 1, 1) }),
    passed(R78, part2, { 1: Outcomes.hasContent(None, 1, -1) }),
  ]);
});

test("evaluates() does not consider empty text as content", async (t) => {
  const part1 = <h1>Hello</h1>;
  const part2 = <h1>World</h1>;

  const document = h.document([part1, h.text("  \n\t \t \n  "), part2]);

  t.deepEqual(await evaluate(R78, { document }), [
    failed(R78, part1, { 1: Outcomes.hasNoContent(Some.of(part2), 1, 1) }),
    failed(R78, part2, { 1: Outcomes.hasNoContent(None, 1, -1) }),
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
