import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R7, { Outcomes } from "../../src/sia-r7/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an element with a lang attribute within <body> with a valid language tag", async (t) => {
  const element = <span lang="en">Hello World</span>;
  const target = element.attribute("lang").get();

  const document = h.document([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [
    passed(R7, target, {
      1: Outcomes.HasValidLanguage,
    }),
  ]);
});

test("evaluate() passes an element with a lang attribute within <body> that is not visible", async (t) => {
  const element = (
    <span lang="en" style={{ display: "hidden" }}>
      Hello World
    </span>
  );
  const target = element.attribute("lang").get();

  const document = h.document([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [
    passed(R7, target, {
      1: Outcomes.HasValidLanguage,
    }),
  ]);
});

test("evaluate() passes an element with a lang attribute within <body> that is not included in the accessibility tree", async (t) => {
  const element = (
    <span lang="en" aria-hidden="true">
      Hello World
    </span>
  );
  const target = element.attribute("lang").get();

  const document = h.document([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [
    passed(R7, target, {
      1: Outcomes.HasValidLanguage,
    }),
  ]);
});

test("evaluate() passes an element with a lang attribute within <body> when the element's lang attribute overwrites an invalid lang attribute", async (t) => {
  const element = (
    <span lang="en" style={{ diplay: "none" }}>
      Hello World
    </span>
  );
  const target = element.attribute("lang").get();

  const document = h.document([
    <body>
      <div lang="invalid">{element}</div>
    </body>,
  ]);

  t.deepEqual(await evaluate(R7, { document }), [
    passed(R7, target, {
      1: Outcomes.HasValidLanguage,
    }),
  ]);
});

test(`evaluate() passes a span with a lang attribute within <body>  when the element's lang attribute overwrites an invalid lang attribute and ignores intertext whitespace`, async (t) => {
  const span = <span lang="en">Hello World</span>;
  const target = span.attribute("lang").get();

  const document = h.document([
    <body>
      <div lang="invalid"> {span} </div>
    </body>,
  ]);

  t.deepEqual(await evaluate(R7, { document }), [
    passed(R7, target, { 1: Outcomes.HasValidLanguage }),
  ]);
});

test("evaluate() fails an element with a lang attribute within <body> with an invalid value", async (t) => {
  const element = (
    <span lang="invalid">
      <img src="/test-assets/shared/fireworks.jpg" alt="Fireworks over Paris" />
    </span>
  );
  const target = element.attribute("lang").get()!;

  const document = h.document([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [
    failed(R7, target, {
      1: Outcomes.HasNoValidLanguage,
    }),
  ]);
});

test("evaluate() fails a text element with a lang attribute within <body> with an invalid value", async (t) => {
  const element = <span lang="invalid">Hello World</span>;
  const target = element.attribute("lang").get()!;

  const document = h.document([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [
    failed(R7, target, {
      1: Outcomes.HasNoValidLanguage,
    }),
  ]);
});

test("evaluate() correctly handles nested elements with valid/invalid lang attributes", async (t) => {
  const element1 = <span lang="en">World</span>;
  const element2 = <div lang="invalid">Hello {element1}</div>;

  const target1 = element1.attribute("lang").get();
  const target2 = element2.attribute("lang").get();

  const document = h.document([<body>{element2}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [
    failed(R7, target2, {
      1: Outcomes.HasNoValidLanguage,
    }),
    passed(R7, target1, {
      1: Outcomes.HasValidLanguage,
    }),
  ]);
});

test("evaluate() is inapplicable for an element that is not visible or included in the accessibility tree", async (t) => {
  const element = <span lang="invalid" hidden />;

  const document = h.document([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [inapplicable(R7)]);
});

test("evaluate() is inapplicable for an element with empty lang attribute", async (t) => {
  const element = <span lang="" />;

  const document = h.document([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [inapplicable(R7)]);
});

test("evaluate() is inapplicable for an element with only whitespace lang attribute", async (t) => {
  const element = <span lang="  " />;

  const document = h.document([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [inapplicable(R7)]);
});
