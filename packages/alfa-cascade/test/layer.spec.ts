import { Array } from "@siteimprove/alfa-array";
import { Comparison } from "@siteimprove/alfa-comparable";
import { test } from "@siteimprove/alfa-test";

import { Layer } from "../src/precedence";

function pair(name: string): Layer.Pair<false> {
  return {
    name,
    normal: Layer.of(name, false),
    important: Layer.of(name, true),
  };
}

test("#withOrder() mutates layers", (t) => {
  const layer = Layer.of("foo", false);
  t(isNaN(layer.order));

  layer.withOrder(42);
  t.equal(layer.order, 42);
});

test(".compareUnordered() considers name prefix as smaller, without considering declaration order", (t) => {
  const compare = Layer.compareUnordered([]);

  const foo = pair("foo");
  const fooBar = pair("foo.bar");
  const fooBaz = pair("foo.baz");
  const fooBarBaz = pair("foo.bar.baz");

  t.equal(compare(foo, fooBar), Comparison.Less);
  t.equal(compare(foo, fooBaz), Comparison.Less);
  t.equal(compare(foo, fooBarBaz), Comparison.Less);
  t.equal(compare(fooBar, fooBarBaz), Comparison.Less);
});

test(".compareUnordered() reverses declaration order for unrelated names", (t) => {
  const foo = pair("foo");
  const bar = pair("bar");
  const baz = pair("baz");
  const compare = Layer.compareUnordered([foo, bar, baz]);

  t.equal(compare(foo, bar), Comparison.Greater);
  t.equal(compare(foo, baz), Comparison.Greater);
  t.equal(compare(bar, baz), Comparison.Greater);
});

test(".compareUnordered() reverses declaration order of first diverging segment", (t) => {
  const foo = pair("foo");
  const fooBar = pair("foo.bar");
  const fooBaz = pair("foo.baz");
  const fooBazLong = pair("foo.baz.will.not.be.used");
  const bar = pair("bar");
  const compare = Layer.compareUnordered([
    foo,
    fooBar,
    fooBaz,
    fooBazLong,
    bar,
  ]);

  t.equal(compare(foo, bar), Comparison.Greater);
  t.equal(compare(fooBar, fooBazLong), Comparison.Greater);
  t.equal(compare(bar, fooBar), Comparison.Less);
});

test(".sortUnordered() sorts and update layers with order", (t) => {
  const pair1 = pair("bar.foo");
  const pair2 = pair("");
  const pair3 = pair("bar");
  const pair4 = pair("bar.baz");
  const pair5 = pair("lorem.ipsum");
  const pair6 = pair("lorem");

  t(isNaN(pair1.normal.order));
  t(isNaN(pair1.important.order));
  t(isNaN(pair2.normal.order));
  t(isNaN(pair2.important.order));
  t(isNaN(pair3.normal.order));
  t(isNaN(pair3.important.order));
  t(isNaN(pair4.normal.order));
  t(isNaN(pair4.important.order));
  t(isNaN(pair5.normal.order));
  t(isNaN(pair5.important.order));
  t(isNaN(pair6.normal.order));
  t(isNaN(pair6.important.order));

  const actual = Layer.sortUnordered([
    pair1,
    pair2,
    pair3,
    pair4,
    pair5,
    pair6,
  ]);

  t.deepEqual(Array.toJSON(actual), [
    {
      name: "",
      normal: { name: "", order: -1 },
      important: { name: "", order: 1 },
    },
    {
      name: "lorem",
      normal: { name: "lorem", order: -2 },
      important: { name: "lorem", order: 2 },
    },
    {
      name: "lorem.ipsum",
      normal: { name: "lorem.ipsum", order: -3 },
      important: { name: "lorem.ipsum", order: 3 },
    },
    {
      name: "bar",
      normal: { name: "bar", order: -4 },
      important: { name: "bar", order: 4 },
    },
    {
      name: "bar.baz",
      normal: { name: "bar.baz", order: -5 },
      important: { name: "bar.baz", order: 5 },
    },
    {
      name: "bar.foo",
      normal: { name: "bar.foo", order: -6 },
      important: { name: "bar.foo", order: 6 },
    },
  ]);

  // Check that the initial layers have been mutated.
  t.equal(pair1.normal.order, -6);
  t.equal(pair1.important.order, 6);
  t.equal(pair2.normal.order, -1);
  t.equal(pair2.important.order, 1);
  t.equal(pair3.normal.order, -4);
  t.equal(pair3.important.order, 4);
  t.equal(pair4.normal.order, -5);
  t.equal(pair4.important.order, 5);
  t.equal(pair5.normal.order, -3);
  t.equal(pair5.important.order, 3);
  t.equal(pair6.normal.order, -2);
  t.equal(pair6.important.order, 2);
});
