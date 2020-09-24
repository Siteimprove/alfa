import { h } from "@siteimprove/alfa-dom/h";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R15, { Outcomes } from "../../src/sia-r15/rule";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable, cantTell } from "../common/outcome";

test("evaluate() passes when two iframes embed the exact same resource", async (t) => {
  const iframe1 = <iframe title="Foo" src="http://somewhere.com/foo.html" />;
  const iframe2 = (
    <iframe aria-label="Foo" src="http://somewhere.com/foo.html" />
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
  const iframe1 = <iframe title="Foo" src="http://somewhere.com/foo1.html" />;
  const iframe2 = (
    <iframe aria-label="Foo" src="http://somewhere.com/foo2.html" />
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
  const iframe1 = <iframe title="Foo" src="http://somewhere.com/foo.html" />;
  const nested = (
    <iframe aria-label="Foo" src="http://somewhere.com/foo.html" />
  );
  const iframe2 = <iframe title="Container">{h.document([nested])}</iframe>;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, [iframe1, nested], { 1: Outcomes.EmbedSameResources }),
  ]);
});

test("evaluate() fails when two iframes embed different resources", async (t) => {
  const iframe1 = <iframe title="Foobar" src="http://somewhere.com/foo.html" />;
  const iframe2 = (
    <iframe aria-label="Foobar" src="http://somewhere.com/bar.html" />
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
  const iframe1 = <iframe title="Foo" src="http://somewhere.com/foo.html" />;
  const iframe2 = (
    <iframe aria-label="Bar" src="http://somewhere.com/bar.html" />
  );

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [inapplicable(R15)]);
});

test("evaluate() passes when two iframes embed the same resource up to trailing slash", async (t) => {
  const iframe1 = <iframe title="Foo" src="http://somewhere.com/" />;
  const iframe2 = <iframe aria-label="Foo" src="http://somewhere.com" />;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    passed(R15, [iframe1, iframe2], { 1: Outcomes.EmbedSameResources }),
  ]);
});

test("evaluate() can't with invalid URLs", async (t) => {
  const iframe1 = <iframe title="Foo" src="" />;
  const iframe2 = <iframe aria-label="Foo" src="" />;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    cantTell(R15, [iframe1, iframe2]),
  ]);
});

test("evaluate() can't tell with no source", async (t) => {
  const iframe1 = <iframe title="Foo" />;
  const iframe2 = <iframe aria-label="Foo" />;

  const document = Document.of([iframe1, iframe2]);

  t.deepEqual(await evaluate(R15, { document }), [
    cantTell(R15, [iframe1, iframe2]),
  ]);
});
