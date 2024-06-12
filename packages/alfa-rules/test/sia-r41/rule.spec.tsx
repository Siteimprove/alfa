import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R41, { Outcomes } from "../../dist/sia-r41/rule";

import { Group } from "../../dist/common/act/group";

import { Response } from "@siteimprove/alfa-http";
import { URL } from "@siteimprove/alfa-url";
import { WithName } from "../../dist/common/diagnostic";
import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { cantTell, failed, inapplicable, passed } from "../common/outcome";

test(`evaluate() passes two links that have the same name and reference the same
      resource`, async (t) => {
  const accessibleName = "Foo";

  const target = [
    <a href="foo.html">{accessibleName}</a>,
    <a href="foo.html">{accessibleName}</a>,
  ];

  const document = h.document(target);

  t.deepEqual(await evaluate(R41, { document }), [
    passed(R41, Group.of(target), {
      1: Outcomes.ResolveSameResource(accessibleName),
    }),
  ]);
});

test(`evaluate() fails two links that have the same name, but reference
      different resources`, async (t) => {
  const accessibleName = "Foo";

  const target = [
    <a href="foo.html">{accessibleName}</a>,
    <a href="bar.html">{accessibleName}</a>,
  ];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(
      R41,
      { document },
      oracle({
        "reference-equivalent-resources": false,
      }),
    ),
    [
      failed(
        R41,
        Group.of(target),
        {
          1: Outcomes.ResolveDifferentResource(accessibleName),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test(`evaluate() passes two links that have the same name and reference
      equivalent resources`, async (t) => {
  const accessibleName = "Foo";

  const target = [
    <a href="foo.html">{accessibleName}</a>,
    <a href="bar.html">{accessibleName}</a>,
  ];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(
      R41,
      { document },
      oracle({
        "reference-equivalent-resources": true,
      }),
    ),
    [
      passed(
        R41,
        Group.of(target),
        {
          1: Outcomes.ResolveEquivalentResource(accessibleName),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
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
  const accessibleName = "Foo";

  const target = [
    <a href="https://somewhere.com/path/to/foo.html">{accessibleName}</a>,
    <a href="foo.html">{accessibleName}</a>,
    <a href="./foo.html">{accessibleName}</a>,
    <a href="/path/to/foo.html">{accessibleName}</a>,
    <a href="down/../foo.html">{accessibleName}</a>,
    <a href="../to/foo.html">{accessibleName}</a>,
  ];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(R41, {
      document,
      response: Response.of(
        URL.parse("https://somewhere.com/path/to/bar.html").getUnsafe(),
        200,
      ),
    }),
    [
      passed(R41, Group.of(target), {
        1: Outcomes.ResolveSameResource(accessibleName),
      }),
    ],
  );
});

test(`evaluate() gather links from the full page`, async (t) => {
  const accessibleName = "Foo";
  const link1 = <a href="foo.html">{accessibleName}</a>;
  const link2 = <a href="foo.html">{accessibleName}</a>;
  const target = [link1, link2];

  const document = h.document([link1, <iframe>{h.document([link2])}</iframe>]);

  t.deepEqual(await evaluate(R41, { document }), [
    passed(R41, Group.of(target), {
      1: Outcomes.ResolveSameResource(accessibleName),
    }),
  ]);
});

test(`evaluate() can't tell if two links that have the same name references
      equivalent resources`, async (t) => {
  const accessibleName = "Foo";

  const target = [
    <a href="foo.html">{accessibleName}</a>,
    <a href="bar.html">{accessibleName}</a>,
  ];

  const document = h.document(target);

  t.deepEqual(await evaluate(R41, { document }), [
    cantTell(
      R41,
      Group.of(target),
      WithName.of(
        "Do the links resolve to equivalent resources?",
        accessibleName,
      ),
    ),
  ]);
});
