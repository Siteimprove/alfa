import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import R15, { Outcomes } from "../../src/sia-r15/rule";

import { hasId } from "../../src/common/predicate/has-id";

import { evaluate } from "../common/evaluate";
import { oracle } from "../common/oracle";
import { passed, failed, inapplicable, cantTell } from "../common/outcome";

const { isElement, hasName } = Element;
const { and, equals } = Predicate;

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
