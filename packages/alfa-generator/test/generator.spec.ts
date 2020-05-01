import { test } from "@siteimprove/alfa-test";

import { Generator } from "../src/generator";

function* f() {
  yield 1;
  yield 2;
  return "f()";
}

function* g(n: number) {
  yield n * 2;
  yield n * 4;
  return "g()";
}

test("map() applies a function to each value yielded by a generator", (t) => {
  const iterator = Generator.map(f(), (n) => n * 2);
  let next = iterator.next();

  t.equal(next.value, 2);
  next = iterator.next();

  t.equal(next.value, 4);
  next = iterator.next();

  t(next.done);
  t.equal(next.value, "f()");
});

test("flatMap() applies a function to each value yielded by a generator and flattens the result", (t) => {
  const iterator = Generator.flatMap(f(), g);
  let next = iterator.next();

  t.equal(next.value, 2);
  next = iterator.next();

  t.equal(next.value, 4);
  next = iterator.next();

  t.equal(next.value, 4);
  next = iterator.next();

  t.equal(next.value, 8);
  next = iterator.next();

  t(next.done);
  t.equal(next.value, "f()");
});
