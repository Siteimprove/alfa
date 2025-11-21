import { Cascade } from "@siteimprove/alfa-cascade";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import { expect, vitest } from "vitest";

import R44, { Outcomes } from "../../dist/sia-r44/rule.js";

import { evaluate } from "../common/evaluate.js";
import { failed, inapplicable, passed } from "../common/outcome.js";

test("evaluate() passes a page with conditional rotation (transform) that does not restrict orientation", async (t) => {
  const target = <div>Hello</div>;

  const document = h.document(
    [target],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { transform: "rotateZ(1turn)" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [
    passed(R44, target, { 1: Outcomes.RotationNotLocked }),
  ]);
});

test("evaluate() passes a page with conditional rotation (transform) not around the z axis", async (t) => {
  const target = <div>Hello</div>;

  const document = h.document(
    [target],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { transform: "rotateX(90deg)" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [
    passed(R44, target, { 1: Outcomes.RotationNotLocked }),
  ]);
});

test("evaluate() passes a page with conditional rotation (rotate) that does not restrict orientation", async (t) => {
  const target = <div>Hello</div>;

  const document = h.document(
    [target],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { rotate: "z 1turn" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [
    passed(R44, target, { 1: Outcomes.RotationNotLocked }),
  ]);
});

test("evaluate() passes a page with conditional rotation (rotate) not around the z axis", async (t) => {
  const target = <div>Hello</div>;

  const document = h.document(
    [target],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { rotate: "1 1 0 90deg" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [
    passed(R44, target, { 1: Outcomes.RotationNotLocked }),
  ]);
});

test("evaluate() passes() a page with conditional rotation in the shadow DOM", async (t) => {
  const target = <div>Hello</div>;

  const shadow = h.shadow(
    [target],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { transform: "rotateZ(1turn)" }),
        ]),
      ]),
    ],
  );

  const document = h.document([<div>{shadow}</div>]);

  t.deepEqual(await evaluate(R44, { document }), [
    passed(R44, target, { 1: Outcomes.RotationNotLocked }),
  ]);
});

test("evaluate() fails a page with conditional matrix that restricts orientation", async (t) => {
  const target = <div>Hello</div>;

  const document = h.document(
    [target],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", {
            transform:
              "matrix3d(0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
          }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [
    failed(R44, target, { 1: Outcomes.RotationLocked }),
  ]);
});

test("evaluate() fails a page with conditional rotation that restricts orientation", async (t) => {
  const target = <div>Hello</div>;

  const document = h.document(
    [target],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { rotate: "90deg" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [
    failed(R44, target, { 1: Outcomes.RotationLocked }),
  ]);
});

test("evaluate() is inapplicable to invisible elements", async (t) => {
  const document = h.document(
    [<div>Hello</div>],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { transform: "rotateZ(1turn)" }),
        ]),
        h.rule.style("div", { display: "none" }),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [inapplicable(R44)]);
});

test("evaluate() is inapplicable when `transform`/`rotate` is not used", async (t) => {
  const document = h.document(
    [<div>Hello</div>],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { color: "blue" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [inapplicable(R44)]);
});

test("evaluate() is inapplicable when `transform` is used unconditionally", async (t) => {
  const document = h.document(
    [<div>Hello</div>],
    [h.sheet([h.rule.style("div", { transform: "rotateZ(1turn)" })])],
  );

  t.deepEqual(await evaluate(R44, { document }), [inapplicable(R44)]);
});

test("evaluate() is inapplicable when `transform` doesn't depend on orientation", async (t) => {
  const document = h.document(
    [<div>Hello</div>],
    [
      h.sheet([
        h.rule.media("(min-width: 100px)", [
          h.rule.style("div", { transform: "rotateZ(1turn)" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [inapplicable(R44)]);
});

test("evaluate() is inapplicable when `transform` doesn't rotate content", async (t) => {
  const document = h.document(
    [<div>Hello</div>],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { transform: "translateX(100px)" }),
        ]),
      ]),
    ],
  );

  t.deepEqual(await evaluate(R44, { document }), [inapplicable(R44)]);
});

test("evaluate() builds a Cascade when `transform` depends on orientation", async (t) => {
  using cascade = vitest.spyOn(Cascade, "from");

  const document = h.document(
    [<div>Hello</div>],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { transform: "rotateZ(1turn)" }),
        ]),
      ]),
    ],
  );

  await evaluate(R44, { document });

  expect(cascade).toHaveBeenCalled();
});

test("evaluate() does not build a Cascade when `transform` doesn't depend on orientation", async (t) => {
  using cascade = vitest.spyOn(Cascade, "from");

  const document = h.document(
    [<div>Hello</div>],
    [
      h.sheet([
        h.rule.media("(min-width: 100px)", [
          h.rule.style("div", { transform: "rotateZ(1turn)" }),
        ]),
      ]),
    ],
  );

  await evaluate(R44, { document });

  expect(cascade).not.toHaveBeenCalled();
});

test("evaluate() does not build a Cascade when orientation controls no rotation property", async (t) => {
  using cascade = vitest.spyOn(Cascade, "from");

  const document = h.document(
    [<div>Hello</div>],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { fontSize: "larger" }),
        ]),
      ]),
    ],
  );

  await evaluate(R44, { document });

  expect(cascade).not.toHaveBeenCalled();
});
