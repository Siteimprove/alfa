import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R11, { Outcomes } from "../../src/sia-r11/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a link with a name given by content`, async (t) => {
  const target = <a href="#">Foo</a>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R11, { document }), [
    passed(R11, target, { 1: Outcomes.HasName }),
  ]);
});

test(`evaluate() passes an image link with name given by the alt text`, async (t) => {
  const target = (
    <a href="#">
      <img src="foo.jpg" alt="Foo" />
    </a>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R11, { document }), [
    passed(R11, target, { 1: Outcomes.HasName }),
  ]);
});

test(`evaluate() fails a link with no name`, async (t) => {
  const target = <a href="#"></a>;

  const document = h.document([target]);

  t.deepEqual(await evaluate(R11, { document }), [
    failed(R11, target, { 1: Outcomes.HasNoName }),
  ]);
});

test(`evaluate() fails an 'a' element, which inherits semantically a link role from role, with no accessible name`, async (t) => {
  const target = (
    <a href="#" role="I am giving a link role">
      <img src="Foo.jpg" alt="" />
    </a>
  );

  const document = h.document([target]);

  t.deepEqual(await evaluate(R11, { document }), [
    failed(R11, target, { 1: Outcomes.HasNoName }),
  ]);
});

test(`evaluate() is inapplicable when there is no link`, async (t) => {
  const document = h.document([<div></div>]);

  t.deepEqual(await evaluate(R11, { document }), [inapplicable(R11)]);
});
