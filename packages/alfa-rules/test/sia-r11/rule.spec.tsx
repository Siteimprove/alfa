import { test } from "@siteimprove/alfa-test";
import { Document } from "@siteimprove/alfa-dom";

import R11, { Outcomes } from "../../src/sia-r11/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes a link with a name given by content`, async (t) => {
  const target = <a href="#">Foo</a>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R11, { document }), [
    passed(R11, target, { 1: Outcomes.HasName }),
  ]);
});

test(`evaluate() fails a link with no name`, async (t) => {
  const target = <a href="#"></a>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R11, { document }), [
    failed(R11, target, { 1: Outcomes.HasNoName }),
  ]);
});

test(`evaluate() is inapplicable when there is no link`, async (t) => {
  const document = Document.of([<div></div>]);

  t.deepEqual(await evaluate(R11, { document }), [inapplicable(R11)]);
});

test(`evaluate() passes an image link with name given by the alt text`, async (t) => {
  const target = (
    <a href="#" tabindex="-1">
      <img src="foo.jpg" alt="Foo" />
    </a>
  );

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R11, { document }), [
    passed(R11, target, { 1: Outcomes.HasName }),
  ]);
});
