import { test } from "@siteimprove/alfa-test";

import { Trampoline } from "../dist/trampoline.js";

test("#map() applies a function to the result of a trampolined computation", (t) => {
  const n = Trampoline.delay(() => 42).map((n) => n.toString());

  t.equal(n.run(), "42");
});

test("#map() does not overflow for long done() chains", (t) => {
  let n = Trampoline.done(0);

  for (let i = 0; i < 100000; i++) {
    n = n.map((n) => n + 1);
  }

  t.equal(n.run(), 100000);
});

test("#map() does not overflow for long delay() chains", (t) => {
  let n = Trampoline.delay(() => 0);

  for (let i = 0; i < 100000; i++) {
    n = n.map((n) => n + 1);
  }

  t.equal(n.run(), 100000);
});

test("#map() does not run a suspended trampolined computation", (t) => {
  Trampoline.delay(() => 42).map(() => {
    throw new Error("The computation was run");
  });
});

test("#flatMap() applies a function to the result of a trampolined computation and flattens the result", (t) => {
  const n = Trampoline.delay(() => 42).flatMap((n) =>
    Trampoline.delay(() => n.toString()),
  );

  t.equal(n.run(), "42");
});

test("#flatMap() does not overflow for long done() chains", (t) => {
  let n = Trampoline.done(0);

  for (let i = 0; i < 100000; i++) {
    n = n.flatMap((n) => Trampoline.done(n + 1));
  }

  t.equal(n.run(), 100000);
});

test("#flatMap() does not overflow for long nested done() chains", (t) => {
  function count(n: number, i = 0): Trampoline<number> {
    const t = Trampoline.done(i);
    return t.flatMap((i) => (i === n ? t : count(n, i + 1)));
  }

  const n = count(100000);

  t.equal(n.run(), 100000);
});

test("#flatMap() does not overflow for long delay() chains", (t) => {
  let n = Trampoline.delay(() => 0);

  for (let i = 0; i < 100000; i++) {
    n = n.flatMap((n) => Trampoline.delay(() => n + 1));
  }

  t.equal(n.run(), 100000);
});

test("#flatMap() does not overflow for long nested delay() chains", (t) => {
  function count(n: number, i = 0): Trampoline<number> {
    const t = Trampoline.delay(() => i);
    return t.flatMap((i) =>
      i === n ? t : count(n, i + 1).flatMap((i) => count(n, i)),
    );
  }

  const n = count(100000);

  t.equal(n.run(), 100000);
});

test(".suspend() can construct a stack-safe recursive computation", (t) => {
  function count(n: number, i = 0): Trampoline<number> {
    if (i === n) {
      return Trampoline.done(i);
    }

    return Trampoline.suspend(() => count(n, i + 1));
  }

  const n = count(100000);

  t.equal(n.run(), 100000);
});

test("Trampolined thunks are not frozen", (t) => {
  let called = 0;
  // Everytime the trampoline is run, the thunk is called and the counter is incremented
  const trampoline = Trampoline.delay(() => ++called);

  t.equal(called, 0);

  t.equal(trampoline.run(), 1);
  t.equal(called, 1);

  t.equal(trampoline.run(), 2);
  t.equal(called, 2);
});

test("Trampolined thunks share state between maps", (t) => {
  let called = 0;
  // The thunk is duplicated between the trampoline and the mapped trampoline,
  // sharing and incrementing the same counter whenever one is called.
  const trampoline = Trampoline.delay(() => ++called);
  const mapped = trampoline.map((n) => n * -1);

  t.equal(called, 0);

  t.equal(trampoline.run(), 1);
  t.equal(called, 1);

  t.equal(mapped.run(), -2);
  t.equal(called, 2);

  t.equal(trampoline.run(), 3);
  t.equal(called, 3);

  t.equal(mapped.run(), -4);
  t.equal(called, 4);
});
