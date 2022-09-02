/// <reference lib="dom" />
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R41, { Outcomes } from "../../src/sia-r41/rule";

import { Group } from "../../src/common/act/group";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable } from "../common/outcome";
import { Response } from "@siteimprove/alfa-http";
import { URL } from "@siteimprove/alfa-url";

test(`evaluate() passes two links that have the same name and reference the same
      resource`, async (t) => {
  const target = [<a href="foo.html">Foo</a>, <a href="foo.html">Foo</a>];

  const document = h.document(target);

  t.deepEqual(await evaluate(R41, { document }), [
    passed(R41, Group.of(target), {
      1: Outcomes.ResolveSameResource,
    }),
  ]);
});

test(`evaluate() fails two links that have the same name, but reference
      different resources`, async (t) => {
  const target = [<a href="foo.html">Foo</a>, <a href="bar.html">Foo</a>];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(
      R41,
      { document },
      oracle({
        "reference-equivalent-resources": false,
      })
    ),
    [
      failed(R41, Group.of(target), {
        1: Outcomes.ResolveDifferentResource,
      }),
    ]
  );
});

test(`evaluate() passes two links that have the same name and reference
      equivalent resources`, async (t) => {
  const target = [<a href="foo.html">Foo</a>, <a href="bar.html">Foo</a>];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(
      R41,
      { document },
      oracle({
        "reference-equivalent-resources": true,
      })
    ),
    [
      passed(R41, Group.of(target), {
        1: Outcomes.ResolveEquivalentResource,
      }),
    ]
  );
});

test(`evaluate() is inapplicable to two links that have different names`, async (t) => {
  const document = h.document([
    <a href="foo.html">Foo</a>,
    <a href="bar.html">Bar</a>,
  ]);

  t.deepEqual(await evaluate(R41, { document }), [inapplicable(R41)]);
});

test("evaluate() correctly resolves relative URLs", async (t) => {
  const target = [
    <a href="https://somewhere.com/path/to/foo.html">Foo</a>,
    <a href="foo.html">Foo</a>,
    <a href="./foo.html">Foo</a>,
    <a href="/path/to/foo.html">Foo</a>,
    <a href="down/../foo.html">Foo</a>,
    <a href="../to/foo.html">Foo</a>,
  ];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(R41, {
      document,
      response: Response.of(
        URL.parse("https://somewhere.com/path/to/bar.html").get(),
        200
      ),
    }),
    [
      passed(R41, Group.of(target), {
        1: Outcomes.ResolveSameResource,
      }),
    ]
  );
});

test(`evaluate() gather links from the full page`, async (t) => {
  const link1 = <a href="foo.html">Foo</a>;
  const link2 = <a href="foo.html">Foo</a>;
  const target = [link1, link2];

  const document = h.document([link1, <iframe>{h.document([link2])}</iframe>]);

  console.dir(document.toJSON());

  t.deepEqual(await evaluate(R41, { document }), [
    passed(R41, Group.of(target), {
      1: Outcomes.ResolveSameResource,
    }),
  ]);
});
