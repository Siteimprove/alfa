import { Outcome } from "@siteimprove/alfa-act";
import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R55, { Outcomes, WithRoleAndName } from "../../dist/sia-r55/rule.js";

import { evaluate } from "../common/evaluate.js";
import { oracle } from "../common/oracle.js";
import { passed, failed, inapplicable, cantTell } from "../common/outcome.js";

import { Group } from "../../dist/common/act/group.js";

test("evaluate() cannot tell when same landmarks have same names", async (t) => {
  const aside1 = <aside aria-label="More information" id="author" />;
  const aside2 = <aside aria-label="More information" id="book" />;

  const document = h.document([aside1, aside2]);
  const target = Group.of([aside1, aside2]);

  t.deepEqual(await evaluate(R55, { document }), [
    cantTell(
      R55,
      target,
      WithRoleAndName.of(
        `Do these complementary landmarks have the same or equivalent content?`,
        "complementary",
        "More information",
      ),
    ),
  ]);
});

test("evaluate() passes when same landmarks have same names and content", async (t) => {
  const aside1 = <aside aria-label="More information" />;
  const aside2 = <aside aria-label="More information" />;

  const document = h.document([aside1, aside2]);
  const target = Group.of([aside1, aside2]);

  t.deepEqual(
    await evaluate(
      R55,
      { document },
      oracle({ "is-content-equivalent": true }),
    ),
    [
      passed(
        R55,
        target,
        {
          1: Outcomes.SameResource("complementary", "More information"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails when same landmarks have same names but different content", async (t) => {
  const aside1 = <aside aria-label="More information" id="author" />;
  const aside2 = <aside aria-label="More information" id="book" />;

  const document = h.document([aside1, aside2]);
  const target = Group.of([aside1, aside2]);

  t.deepEqual(
    await evaluate(
      R55,
      { document },
      oracle({ "is-content-equivalent": false }),
    ),
    [
      failed(
        R55,
        target,
        {
          1: Outcomes.DifferentResources("complementary", "More information"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() fails when same sections have same names", async (t) => {
  const section1 = <section aria-label="More information" />;
  const section2 = <section aria-label="More information" />;

  const document = h.document([section1, section2]);
  const target = Group.of([section1, section2]);

  t.deepEqual(
    await evaluate(
      R55,
      { document },
      oracle({ "is-content-equivalent": false }),
    ),
    [
      failed(
        R55,
        target,
        {
          1: Outcomes.DifferentResources("region", "More information"),
        },
        Outcome.Mode.SemiAuto,
      ),
    ],
  );
});

test("evaluate() is inapplicable when same landmarks have different names", async (t) => {
  const author = <aside aria-label="About the author" id="author" />;
  const book = <aside aria-label="About the book" id="book" />;

  const document = h.document([author, book]);

  t.deepEqual(await evaluate(R55, { document }), [inapplicable(R55)]);
});

test("evaluate() is inapplicable when landmarks have different roles", async (t) => {
  const element = <aside aria-label="Site" />;
  const nav = <nav aria-label="Site" />;

  const document = h.document([element, nav]);

  t.deepEqual(await evaluate(R55, { document }), [inapplicable(R55)]);
});

test("evaluate() is inapplicable to section without accessible name and role", async (t) => {
  const section = <section />;

  const document = h.document([section]);

  t.deepEqual(await evaluate(R55, { document }), [inapplicable(R55)]);
});
