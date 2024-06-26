import { test } from "@siteimprove/alfa-test";

import { Declaration } from "@siteimprove/alfa-dom";

import { Variable } from "../dist/variable.js";

const varFoo = (value: string, important: boolean = false) =>
  Declaration.of("--foo", value, important);
const varBar = (value: string, important: boolean = false) =>
  Declaration.of("--bar", value, important);
const propFoo = Declaration.of("foo", "foo");
const propBar = Declaration.of("bar", "bar");

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
