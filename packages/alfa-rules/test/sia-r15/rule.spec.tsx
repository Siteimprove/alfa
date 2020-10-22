import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";
import { Response } from "@siteimprove/alfa-http";
import { URL } from "@siteimprove/alfa-url";

import R15, { Outcomes } from "../../src/sia-r15/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable, cantTell } from "../common/outcome";

test("evaluate() passes when two iframes embed the exact same resource", async (t) => {
  const iframe1 = <iframe title="Foo" src="https://somewhere.com/foo.html" />;
  const iframe2 = (
    <iframe aria-label="Foo" src="https://somewhere.com/foo.html" />
  );

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, [iframe1, iframe2], { 1: Outcomes.EmbedSameResources }),
  ]);
});

test("evaluate() passes when two iframes embed the exact same resource via srcdoc", async (t) => {
  const iframe1 = <iframe title="Foo" srcdoc="<span>foo</span>" />;
  const iframe2 = <iframe aria-label="Foo" srcdoc="<span>foo</span>" />;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, [iframe1, iframe2], { 1: Outcomes.EmbedSameResources }),
  ]);
});

test("evaluate() passes when two iframes embed equivalent resources", async (t) => {
  const iframe1 = <iframe title="Foo" src="https://somewhere.com/foo1.html" />;
  const iframe2 = (
    <iframe aria-label="Foo" src="https://somewhere.com/foo2.html" />
  );

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(
    await evaluate(
      R15,
      { document },
      oracle({ "reference-equivalent-resources": true })
    ),
    [passed(R15, [iframe1, iframe2], { 1: Outcomes.EmbedEquivalentResources })]
  );
});

test("evaluate() passes when toplevel and nested iframe embed the same resource", async (t) => {
  const iframe1 = <iframe title="Foo" src="https://somewhere.com/foo.html" />;
  const nested = (
    <iframe aria-label="Foo" src="https://somewhere.com/foo.html" />
  );
  const iframe2 = <iframe title="Container">{h.document([nested])}</iframe>;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, [iframe1, nested], { 1: Outcomes.EmbedSameResources }),
  ]);
});

test("evaluate() fails when two iframes embed different resources", async (t) => {
  const iframe1 = (
    <iframe title="Foobar" src="https://somewhere.com/foo.html" />
  );
  const iframe2 = (
    <iframe aria-label="Foobar" src="https://somewhere.com/bar.html" />
  );

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(
    await evaluate(
      R15,
      { document },
      oracle({ "reference-equivalent-resources": false })
    ),
    [failed(R15, [iframe1, iframe2], { 1: Outcomes.EmbedDifferentResources })]
  );
});

test("evaluate() is inapplicable when there is no two iframe with the same name", async (t) => {
  const iframe1 = <iframe title="Foo" src="https://somewhere.com/foo.html" />;
  const iframe2 = (
    <iframe aria-label="Bar" src="https://somewhere.com/bar.html" />
  );

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [inapplicable(R15)]);
});

test("evaluate() can't tell if URLs are identical but invalid", async (t) => {
  const iframe1 = <iframe title="Foo" src="https:////////@@@" />;
  const iframe2 = <iframe aria-label="Foo" src="https:////////@@@" />;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    cantTell(R15, [iframe1, iframe2]),
  ]);
});

test("evaluate() can't tell if there is no source", async (t) => {
  const iframe1 = <iframe title="Foo" />;
  const iframe2 = <iframe aria-label="Foo" />;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    cantTell(R15, [iframe1, iframe2]),
  ]);
});

test("evaluate() passes when two iframes embed the same resource up to trailing slash", async (t) => {
  const iframe1 = <iframe title="Foo" src="https://somewhere.com/" />;
  const iframe2 = <iframe aria-label="Foo" src="https://somewhere.com" />;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, [iframe1, iframe2], { 1: Outcomes.EmbedSameResources }),
  ]);
});

test("evaluate() correctly resolves relative URLs", async (t) => {
  const iframe1 = (
    <iframe title="Foo" src="https://somewhere.com/path/to/foo.html" />
  );
  const iframe2 = <iframe title="Foo" src="foo.html" />;
  const iframe3 = <iframe title="Foo" src="./foo.html" />;
  const iframe4 = <iframe title="Foo" src="/path/to/foo.html" />;
  const iframe5 = <iframe title="Foo" src="down/../foo.html" />;
  const iframe6 = <iframe title="Foo" src="../to/foo.html" />;

  const document = Document.of([
    iframe1,
    iframe2,
    iframe3,
    iframe4,
    iframe5,
    iframe6,
  ]);

  t.deepEqual(
    await evaluate(R15, {
      document,
      response: Response.of(
        URL.parse("https://somewhere.com/path/to/bar.html").get(),
        200
      ),
    }),
    [
      passed(R15, [iframe1, iframe2, iframe3, iframe4, iframe5, iframe6], {
        1: Outcomes.EmbedSameResources,
      }),
    ]
  );
});
