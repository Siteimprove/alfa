import { test } from "@siteimprove/alfa-test";

import { Trampoline } from "../src/trampoline";

test("map() applies a function to the result of a trampolined computation", t => {
  const n = Trampoline.delay(() => 42).map(n => n.toString());

  t.equal(n.run(), "42");
});

test("map() does not overflow for long chains", t => {
  let n = Trampoline.delay(() => 0);

  for (let i = 0; i < 10000; i++) {
    n = n.map(n => n + 1);
  }

  t.equal(n.run(), 10000);
});

test("map() does not run a suspended trampolined computation", t => {
  Trampoline.delay(() => 42).map(() => {
    throw new Error("The computation was run");
  });
});

test("flatMap() applies a function to the result of a trampolined computation and flattens the result", t => {
  const n = Trampoline.delay(() => 42).flatMap(n =>
    Trampoline.delay(() => n.toString())
  );

  t.equal(n.run(), "42");
});

test("flatMap() does not overflow for long done() chains", t => {
  let n = Trampoline.done(0);

  for (let i = 0; i < 10000; i++) {
    n = n.flatMap(n => Trampoline.done(n + 1));
  }

  t.equal(n.run(), 10000);
});

test("flatMap() does not overflow for long nested done() chains", t => {
  function count(n: number, i = 0): Trampoline<number> {
    const t = Trampoline.done(i);
    return t.flatMap(i => (i === n ? t : count(n, i + 1)));
  }

  const n = count(10000);

  t.equal(n.run(), 10000);
});

test("flatMap() does not overflow for long delay() chains", t => {
  let n = Trampoline.delay(() => 0);

  for (let i = 0; i < 10000; i++) {
    n = n.flatMap(n => Trampoline.delay(() => n + 1));
  }

  t.equal(n.run(), 10000);
});

test("flatMap() does not overflow for long nested delay() chains", t => {
  function count(n: number, i = 0): Trampoline<number> {
    const t = Trampoline.delay(() => i);
    return t.flatMap(i =>
      i === n ? t : count(n, i + 1).flatMap(i => count(n, i))
    );
  }

  const n = count(10000);

  t.equal(n.run(), 10000);
});

test("suspend() can construct a stack-safe recursive computation", t => {
  function count(n: number, i = 0): Trampoline<number> {
    if (i === n) {
      return Trampoline.done(i);
    }

    return Trampoline.suspend(() => count(n, i + 1));
  }

  const n = count(10000);

  t.equal(n.run(), 10000);
});
