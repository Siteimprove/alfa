import { test } from "@siteimprove/alfa-test";

import { Lazy } from "@siteimprove/alfa-lazy";
import { Sequence } from "../src/sequence";

const zeroes = (n: number) => new Array(n).fill(0);

test("map() applies a function to each value of a sequence", t => {
  const seq = Sequence.from([1, 2, 3, 4]).map(n => n * 2);

  t.deepEqual([...seq], [2, 4, 6, 8]);
});

test("map() does not overflow for long chains", t => {
  let seq = Sequence.from([0]);

  for (let i = 0; i < 100000; i++) {
    seq = seq.map(n => n + 1);
  }

  t.deepEqual([...seq], [100000]);
});

test("map() does not overflow for long sequences", t => {
  const seq = Sequence.from(zeroes(100000)).map(n => n + 1);

  t.deepEqual(
    [...seq],
    zeroes(100000).map(n => n + 1)
  );
});

test("map() does not force the tail of a sequence", t => {
  Sequence.of(
    1,
    Lazy.of(() => {
      throw new Error("The tail was forced");
    })
  ).map(n => n + 1);
});

test("equals() checks if two sequences are equal", t => {
  const a = Sequence.from([1, 2, 3, 4]);
  const b = Sequence.from([1, 2, 3, 4]);
  const c = Sequence.from([2, 3, 4, 5]);

  t(a.equals(b));
  t(!a.equals(c));
});

test("equals() does not overflow for long sequences", t => {
  const a = Sequence.from(zeroes(100000));
  const b = Sequence.from(zeroes(100000));

  t(a.equals(b));
});
