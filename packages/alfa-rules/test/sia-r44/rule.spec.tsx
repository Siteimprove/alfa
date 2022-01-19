import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R44, { Outcomes } from "../../src/sia-r44/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a page with conditional rotation that does not restrict orientation", async (t) => {
  const target = <div>Hello</div>;

  const document = h.document(
    [target],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { transform: "rotateZ(1turn)" }),
        ]),
      ]),
    ]
  );

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
    ]
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
    ]
  );

  t.deepEqual(await evaluate(R44, { document }), [inapplicable(R44)]);
});

test("evaluate() is inapplicable when `transform` is not used", async (t) => {
  const document = h.document(
    [<div>Hello</div>],
    [
      h.sheet([
        h.rule.media("(orientation: portrait)", [
          h.rule.style("div", { color: "blue" }),
        ]),
      ]),
    ]
  );

  t.deepEqual(await evaluate(R44, { document }), [inapplicable(R44)]);
});

test("evaluate() is inapplicable when `transform` is used unconditionally", async (t) => {
  const document = h.document(
    [<div>Hello</div>],
    [h.sheet([h.rule.style("div", { transform: "rotateZ(1turn)" })])]
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
    ]
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
    ]
  );

  t.deepEqual(await evaluate(R44, { document }), [inapplicable(R44)]);
});
