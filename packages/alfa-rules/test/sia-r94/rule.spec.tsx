import { Document } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import R94, { Outcomes } from "../../src/sia-r94/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a menuitem with an accessible name", async (t) => {
  const target = <li role="menuitem">Foo</li>;

  const document = Document.of([<ul role="menu">{target}</ul>]);

  t.deepEqual(await evaluate(R94, { document }), [
    passed(R94, target, { 1: Outcomes.HasName }),
  ]);
});

test("evaluate() fails a menuitem with no accessible name", async (t) => {
  const target = (
    <li role="menuitem">
      <img src="foo.svg" alt="" />
    </li>
  );

  const document = Document.of([<ul role="menu">{target}</ul>]);

  t.deepEqual(await evaluate(R94, { document }), [
    failed(R94, target, { 1: Outcomes.HasNoName }),
  ]);
});

test("evaluate() is inapplicable when there is no menuitem", async (t) => {
  const document = Document.of([
    <menu>
      <li>Foo</li>
    </menu>,
  ]);

  t.deepEqual(await evaluate(R94, { document }), [inapplicable(R94)]);
});

test("evaluate() is inapplicable on menuitem that are not exposed", async (t) => {
  const document = Document.of([
    <ul role="menu" hidden>
      <li role="menuitem">Foo</li>
    </ul>,
  ]);

  t.deepEqual(await evaluate(R94, { document }), [inapplicable(R94)]);
});
