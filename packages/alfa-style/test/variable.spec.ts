import { test } from "@siteimprove/alfa-test";

import { Declaration } from "@siteimprove/alfa-dom";

import { Variable } from "../dist/variable.js";

const varFoo = (value: string, important: boolean = false) =>
  Declaration.of("--foo", value, important);
const varBar = (value: string, important: boolean = false) =>
  Declaration.of("--bar", value, important);
const propFoo = Declaration.of("foo", "foo");
const propBar = Declaration.of("bar", "bar");

function pretty(vars: Variable.DefinitionMap, name: string): string {
  return vars
    .get(`--${name}`)
    .getUnsafe()
    .value.toArray()
    .map((token) => token.toString())
    .join("");
}

test("gather() builds an empty map when there are no declarations", (t) => {
  const actual = Variable.gather([]);

  t.deepEqual(actual.toJSON(), []);
});

test("gather() gather all declaration starting with --", (t) => {
  const actual = Variable.gather([
    propFoo,
    varFoo("foo"),
    varBar("bar"),
    propBar,
  ]);

  t.deepEqual(actual.toJSON(), [
    [
      "--bar",
      {
        value: [{ type: "ident", value: "bar" }],
        source: { name: "--bar", value: "bar", important: false },
      },
    ],
    [
      "--foo",
      {
        value: [{ type: "ident", value: "foo" }],
        source: { name: "--foo", value: "foo", important: false },
      },
    ],
  ]);
});

test("gather() prefers the first declaration", (t) => {
  const actual = Variable.gather([
    varFoo("foo"),
    varBar("bar", true),
    varFoo("not foo"),
    varBar("not bar", true),
  ]);

  t.deepEqual(actual.toJSON(), [
    [
      "--bar",
      {
        value: [{ type: "ident", value: "bar" }],
        source: { name: "--bar", value: "bar", important: true },
      },
    ],
    [
      "--foo",
      {
        value: [{ type: "ident", value: "foo" }],
        source: { name: "--foo", value: "foo", important: false },
      },
    ],
  ]);
});

test("gather() does not consider precedence of declarations", (t) => {
  // gather() doesn't care about precedence and requires its input to be sorted
  const actual = Variable.gather([varFoo("notfoo"), varFoo("foo", true)]);

  t.deepEqual(actual.toJSON(), [
    [
      "--foo",
      {
        value: [{ type: "ident", value: "notfoo" }],
        source: { name: "--foo", value: "notfoo", important: false },
      },
    ],
  ]);
});

test("flatten() expands variable definitions", (t) => {
  const map = Variable.gather([varFoo("var(--bar)"), varBar("hello")]);

  t.deepEqual(Variable.flatten(map).toJSON(), [
    [
      "--bar",
      {
        value: [{ type: "ident", value: "hello" }],
        source: { name: "--bar", value: "hello", important: false },
      },
    ],
    [
      "--foo",
      {
        value: [{ type: "ident", value: "hello" }],
        source: { name: "--foo", value: "var(--bar)", important: false },
      },
    ],
  ]);
});

test("flatten() expands variables recursively", (t) => {
  // This actually depends on the order of enumeration of the variables map,
  // as the right expansion order may avoid the need for recursively expanding.
  // Therefore, we test with all possible orders. This is done by using the same
  // names but in different positions (initial, intermediate, final). The
  // map is enumerated in the same order of the actual names.
  for (const [intitial, intermediate, final] of [
    ["foo", "bar", "baz"],
    ["foo", "baz", "bar"],
    ["bar", "foo", "baz"],
    ["bar", "baz", "foo"],
    ["baz", "foo", "bar"],
    ["baz", "bar", "foo"],
  ]) {
    const map = Variable.gather([
      Declaration.of(`--${intitial}`, `var(--${intermediate})`),
      Declaration.of(`--${intermediate}`, `var(--${final})`),
      Declaration.of(`--${final}`, "Actual value!"),
    ]);

    const actual = Variable.flatten(map);

    t.deepEqual(
      pretty(actual, intitial),
      "Actual value!",
      `Testing ${intitial} -> ${intermediate} -> ${final}`,
    );

    t.deepEqual(
      pretty(actual, intermediate),
      "Actual value!",
      `Testing ${intitial} -> ${intermediate} -> ${final}`,
    );

    t.deepEqual(
      pretty(actual, final),
      "Actual value!",
      `Testing ${intitial} -> ${intermediate} -> ${final}`,
    );
  }
});

test("flatten() expands variables recursively in fallbacks", (t) => {
  // This actually depends on the order of enumeration of the variables map,
  // as the right expansion order may avoid the need for recursively expanding.
  // Therefore, we test with all possible orders. This is done by using the same
  // names but in different positions (initial, intermediate, final). The
  // map is enumerated in the same order of the actual names.
  for (const [intitial, intermediate, final] of [
    ["foo", "bar", "baz"],
    ["foo", "baz", "bar"],
    ["bar", "foo", "baz"],
    ["bar", "baz", "foo"],
    ["baz", "foo", "bar"],
    ["baz", "bar", "foo"],
  ]) {
    const map = Variable.gather([
      Declaration.of(`--${intitial}`, `var(--invalid, var(--${intermediate}))`),
      Declaration.of(`--${intermediate}`, `var(--${final})`),
      Declaration.of(`--${final}`, "Actual value!"),
    ]);

    const actual = Variable.flatten(map);

    t.deepEqual(
      pretty(actual, intitial),
      "Actual value!",
      `Testing ${intitial} -> (fallback) ${intermediate} -> ${final}`,
    );

    t.deepEqual(
      pretty(actual, intermediate),
      "Actual value!",
      `Testing ${intitial} -> (fallback) ${intermediate} -> ${final}`,
    );

    t.deepEqual(
      pretty(actual, final),
      "Actual value!",
      `Testing ${intitial} -> (fallback) ${intermediate} -> ${final}`,
    );
  }
});
