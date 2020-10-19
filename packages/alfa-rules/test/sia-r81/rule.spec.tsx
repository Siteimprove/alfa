import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R81, { Outcomes } from "../../src/sia-r81/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes two links that have the same name and reference the same
      resource in the same context`, async (t) => {
  const target = [<a href="foo.html">Foo</a>, <a href="foo.html">Foo</a>];

  const document = Document.of([
    <html>
      <p>
        {target[0]}
        {target[1]}
      </p>
    </html>,
  ]);

  t.deepEqual(await evaluate(R81, { document }), [
    passed(R81, target, {
      1: Outcomes.ResolveSameResource,
    }),
  ]);
});

test(`evaluate() fails two links that have the same name, but reference
      different resources in the same context`, async (t) => {
  const target = [<a href="foo.html">Foo</a>, <a href="bar.html">Foo</a>];

  const document = Document.of([
    <html>
      <p>
        {target[0]}
        {target[1]}
      </p>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R81,
      { document },
      oracle({
        "reference-equivalent-resources": false,
      })
    ),
    [
      failed(R81, target, {
        1: Outcomes.ResolveDifferentResource,
      }),
    ]
  );
});

test(`evaluate() passes two links that have the same name and reference
      equivalent resources in the same context`, async (t) => {
  const target = [<a href="foo.html">Foo</a>, <a href="bar.html">Foo</a>];

  const document = Document.of([
    <html>
      <p>
        {target[0]}
        {target[1]}
      </p>
    </html>,
  ]);

  t.deepEqual(
    await evaluate(
      R81,
      { document },
      oracle({
        "reference-equivalent-resources": true,
      })
    ),
    [
      passed(R81, target, {
        1: Outcomes.ResolveEquivalentResource,
      }),
    ]
  );
});

test(`evaluate() is inapplicable to two links that have the same name and
      reference the same resource, but have different contexts`, async (t) => {
  const document = Document.of([
    <html>
      <p>
        <a href="foo.html">Foo</a>
      </p>
      <p>
        <a href="foo.html">Foo</a>
      </p>
    </html>,
  ]);

  t.deepEqual(await evaluate(R81, { document }), [inapplicable(R81)]);
});
