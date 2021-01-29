import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R7, { Outcomes } from "../../src/sia-r7/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes an element with an lang attribute within <body> with a valid language tag", async (t) => {
  const element = <span lang="en">Hello World</span>;
  const target = element.attribute("lang").get();

  const document = Document.of([<body>{element}</body>]);

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

  const document = Document.of([<body>{element}</body>]);

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

  const document = Document.of([<body>{element}</body>]);

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

  const document = Document.of([
    <html lang="en">
      <body>
        <div lang="english">{element}</div>
      </body>
    </html>,
  ]);

  t.deepEqual(await evaluate(R7, { document }), [
    passed(R7, target, {
      1: Outcomes.HasValidLanguage,
    }),
  ]);
});

test("evaluate() fails an element with a lang attribute within <body> with an invalid value", async (t) => {
  const element = <span lang="english">Hello World</span>;
  const target = element.attribute("lang").get()!;

  const document = Document.of([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [
    failed(R7, target, {
      1: Outcomes.HasNoValidLanguage,
    }),
  ]);
});

test("evaluate() is inapplicable for an element that is not visible or included in the accessibility tree", async (t) => {
  const element = <span lang="english" hidden />;

  const document = Document.of([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [inapplicable(R7)]);
});

test("evaluate() is inapplicable for an element with empty lang attribute", async (t) => {
  const element = <span lang="" />;

  const document = Document.of([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [inapplicable(R7)]);
});

test("evaluate() is inapplicable for an element with only whitespace lang attribute", async (t) => {
  const element = <span lang="  " />;

  const document = Document.of([<body>{element}</body>]);

  t.deepEqual(await evaluate(R7, { document }), [inapplicable(R7)]);
});
