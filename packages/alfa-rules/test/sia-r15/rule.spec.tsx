import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { Response } from "@siteimprove/alfa-http";
import { URL } from "@siteimprove/alfa-url";

import R15, { Outcomes } from "../../dist/sia-r15/rule.js";

import { Group } from "../../dist/common/act/group.js";

import { WithName } from "../../dist/common/diagnostic.js";
import { evaluate } from "../common/evaluate.js";
import { oracle } from "../common/oracle.js";
import { cantTell, failed, inapplicable, passed } from "../common/outcome.js";

test("evaluate() passes when two iframes embed the exact same resource", async (t) => {
  const name = "Foo";

  const target = [
    <iframe title={name} src="https://somewhere.com/foo.html" />,
    <iframe aria-label={name} src="https://somewhere.com/foo.html" />,
  ];

  const document = h.document(target);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, Group.of(target), {
      1: Outcomes.EmbedSameResources(name),
    }),
  ]);
});

test("evaluate() passes when two iframes embed the exact same resource via srcdoc", async (t) => {
  const name = "Foo";

  const target = [
    <iframe title={name} srcdoc="<span>foo</span>" />,
    <iframe aria-label={name} srcdoc="<span>foo</span>" />,
  ];

  const document = h.document(target);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, Group.of(target), {
      1: Outcomes.EmbedSameResources(name),
    }),
  ]);
});

test("evaluate() passes when two iframes embed equivalent resources", async (t) => {
  const name = "Foo";

  const target = [
    <iframe title={name} src="https://somewhere.com/foo1.html" />,
    <iframe aria-label={name} src="https://somewhere.com/foo2.html" />,
  ];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(
      R15,
      { document },
      oracle({ "reference-equivalent-resources": true }),
    ),
    [
      passed(
        R15,
        Group.of(target),
        {
          1: Outcomes.EmbedEquivalentResources(name),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() passes when toplevel and nested iframe embed the same resource", async (t) => {
  const name = "Foo";

  const target = [
    <iframe title={name} src="https://somewhere.com/foo.html" />,
    <iframe aria-label={name} src="https://somewhere.com/foo.html" />,
  ];

  const document = h.document([
    target[0],
    <iframe title="Container">{h.document([target[1]])}</iframe>,
  ]);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, Group.of(target), {
      1: Outcomes.EmbedSameResources(name),
    }),
  ]);
});

test("evaluate() fails when two iframes embed different resources", async (t) => {
  const name = "Foobar";

  const target = [
    <iframe title={name} src="https://somewhere.com/foo.html" />,
    <iframe aria-label={name} src="https://somewhere.com/bar.html" />,
  ];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(
      R15,
      { document },
      oracle({ "reference-equivalent-resources": false }),
    ),
    [
      failed(
        R15,
        Group.of(target),
        {
          1: Outcomes.EmbedDifferentResources(name),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() is inapplicable when there is no two iframe with the same name", async (t) => {
  const document = h.document([
    <iframe title="Foo" src="https://somewhere.com/foo.html" />,
    <iframe aria-label="Bar" src="https://somewhere.com/bar.html" />,
  ]);

  t.deepEqual(await evaluate(R15, { document }), [inapplicable(R15)]);
});

test("evaluate() can't tell if URLs are identical but invalid", async (t) => {
  const name = "Foo";

  const target = [
    <iframe title={name} src="https:////////@@@" />,
    <iframe aria-label={name} src="https:////////@@@" />,
  ];

  const document = h.document(target);

  t.deepEqual(await evaluate(R15, { document }), [
    cantTell(
      R15,
      Group.of(target),
      WithName.of("Do the <iframe> elements embed equivalent resources?", name),
    ),
  ]);
});

test("evaluate() can't tell if there is no source", async (t) => {
  const name = "Foo";
  const target = [<iframe title={name} />, <iframe aria-label={name} />];

  const document = h.document(target);

  t.deepEqual(await evaluate(R15, { document }), [
    cantTell(
      R15,
      Group.of(target),
      WithName.of("Do the <iframe> elements embed equivalent resources?", name),
    ),
  ]);
});

test("evaluate() passes when two iframes embed the same resource up to trailing slash", async (t) => {
  const name = "Foo";

  const target = [
    <iframe title={name} src="https://somewhere.com/" />,
    <iframe aria-label={name} src="https://somewhere.com" />,
  ];

  const document = h.document(target);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, Group.of(target), {
      1: Outcomes.EmbedSameResources(name),
    }),
  ]);
});

test("evaluate() correctly resolves relative URLs", async (t) => {
  const name = "Foo";

  const target = [
    <iframe title={name} src="https://somewhere.com/path/to/foo.html" />,
    <iframe title={name} src="foo.html" />,
    <iframe title={name} src="./foo.html" />,
    <iframe title={name} src="/path/to/foo.html" />,
    <iframe title={name} src="down/../foo.html" />,
    <iframe title={name} src="../to/foo.html" />,
  ];

  const document = h.document(target);

  t.deepEqual(
    await evaluate(R15, {
      document,
      response: Response.of(
        URL.parse("https://somewhere.com/path/to/bar.html").getUnsafe(),
        200,
      ),
    }),
    [
      passed(R15, Group.of(target), {
        1: Outcomes.EmbedSameResources(name),
      }),
    ],
  );
});
