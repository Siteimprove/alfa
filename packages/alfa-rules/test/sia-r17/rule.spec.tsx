import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R17, { Outcomes } from "../../src/sia-r17/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes an element which is not focusable by default`, async (t) => {
  const target = <p aria-hidden="true">Some text</p>;

  const document = Document.of([target]);

  t.deepEqual(await evaluate(R17, { document }), [
    passed(R17, target, {
      1: Outcomes.IsNotTabbable,
    }),
  ]);
});

test(`evaluate() passes an element which content is hidden`, async (t) => {
    const target = <div aria-hidden="true">
	<a href="/" style={{display:"none"}}>Link</a>
</div>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R17, { document }), [
      passed(R17, target, {
        1: Outcomes.IsNotTabbable,
      }),
    ]);
  });

  test(`evaluate() passes an element which content is taken out of sequential focus order using tabindex`, async (t) => {
    const target = <div aria-hidden="true">
	<button tabindex="-1">Some button</button>
</div>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R17, { document }), [
      passed(R17, target, {
        1: Outcomes.IsNotTabbable,
      }),
    ]);
  });

  test(`evaluate() passes an element which is disabled`, async (t) => {
    const target = <input disabled aria-hidden="true" />;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R17, { document }), [
      passed(R17, target, {
        1: Outcomes.IsNotTabbable,
      }),
    ]);
  });

  test(`evaluate() fails an element which focusable content`, async (t) => {
    const target = <div aria-hidden="true">
	<a href="/">Link</a>
</div>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R17, { document }), [
      failed(R17, target, {
        1: Outcomes.IsTabbable,
      }),
    ]);
  });

  test(`evaluate() fails an element can't be reset once set to true on an ancestor`, async (t) => {
    const target =<div aria-hidden="true">
	<div aria-hidden="false">
		<button>Some button</button>
	</div>
</div>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R17, { document }), [
      failed(R17, target, {
        1: Outcomes.IsTabbable,
      }),
    ]);
  });

  test(`evaluate() fails an element with focusable content through tabindex`, async (t) => {
    const target =<p tabindex="0" aria-hidden="true">Some text</p>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R17, { document }), [
      failed(R17, target, {
        1: Outcomes.IsTabbable,
      }),
    ]);
  });

  test(`evaluate() fails a focusable summary element`, async (t) => {
    const target = <details aria-hidden="true">
	<summary>Some button</summary>
	<p>Some details</p>
</details>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R17, { document }), [
      failed(R17, target, {
        1: Outcomes.IsTabbable,
      }),
    ]);
  });

  test(`evaluate() is inapplicable when aria-hidden has incorrect value`, async (t) => {
    const target = <div aria-hidden="yes">
	<p>Some text</p>
</div>;
  
    const document = Document.of([target]);
  
    t.deepEqual(await evaluate(R17, { document }), [inapplicable(R17)]);
  });




