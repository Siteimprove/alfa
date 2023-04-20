import { test } from "@siteimprove/alfa-test";

import { Declaration } from "@siteimprove/alfa-dom";

import { Variable } from "../src/variable";
import { shouldOverride } from "../src/style";

const varFoo = (value: string, important: boolean = false) =>
  Declaration.of("--foo", value, important);
const varBar = (value: string, important: boolean = false) =>
  Declaration.of("--bar", value, important);
const propFoo = Declaration.of("foo", "foo");
const propBar = Declaration.of("bar", "bar");

test("gather() builds an empty map when there are no declarations", (t) => {
  const actual = Variable.gather([], shouldOverride);

  t.deepEqual(actual.toJSON(), []);
});

test("gather() gather all declaration starting with --", (t) => {
  const actual = Variable.gather(
    [propFoo, varFoo("foo"), varBar("bar"), propBar],
    shouldOverride
  );

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

test("gather() prefers the first declaration at same importance", (t) => {
  const actual = Variable.gather(
    [
      varFoo("foo"),
      varBar("bar", true),
      varFoo("not foo"),
      varBar("not bar", true),
    ],
    shouldOverride
  );

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

test("gather() prefers important declaration", (t) => {
  const actual = Variable.gather(
    [varFoo("not foo"), varFoo("foo", true)],
    shouldOverride
  );

  t.deepEqual(actual.toJSON(), [
    [
      "--foo",
      {
        value: [{ type: "ident", value: "foo" }],
        source: { name: "--foo", value: "foo", important: true },
      },
    ],
  ]);
});

test("flatten() expands variable definitions", (t) => {
  const map = Variable.gather(
    [varFoo("var(--bar)"), varBar("hello")],
    shouldOverride
  );

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
