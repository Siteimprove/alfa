import { test } from "@siteimprove/alfa-test";

import { Lazy } from "@siteimprove/alfa-lazy";
import { Sequence } from "../src/sequence";

const zeroes = (n: number) => new Array(n).fill(0);

test("#size gets the size of a sequence", t => {
  const seq = Sequence.from([1, 2, 3, 4]);

  t.equal(seq.size, 4);
});

test("#isEmpty() returns true if a sequence is empty", t => {
  t(Sequence.empty().isEmpty());
});

test("#isEmpty() returns false if a sequence is not empty", t => {
  t(!Sequence.from([1, 2, 3, 4]).isEmpty());
});

test("#map() applies a function to each value of a sequence", t => {
  const seq = Sequence.from([1, 2, 3, 4]).map(n => n * 2);

  t.deepEqual([...seq], [2, 4, 6, 8]);
});

test("#map() does not overflow for long chains", t => {
  let seq = Sequence.from([0]);

  for (let i = 0; i < 100000; i++) {
    seq = seq.map(n => n + 1);
  }

  t.deepEqual([...seq], [100000]);
});

test("#map() does not overflow for long sequences", t => {
  const seq = Sequence.from(zeroes(100000)).map(n => n + 1);

  t.deepEqual(
    [...seq],
    zeroes(100000).map(n => n + 1)
  );
});

test("#map() does not force the tail of a sequence", t => {
  Sequence.of(
    1,
    Lazy.of(() => {
      throw new Error("The tail was forced");
    })
  ).map(n => n + 1);
});

test("#flatMap() applies a function to each value of a sequence and flattens the result", t => {
  const seq = Sequence.from([1, 2, 3, 4]).flatMap(n => Sequence.from([n, n]));

  t.deepEqual([...seq], [1, 1, 2, 2, 3, 3, 4, 4]);
});

test("#flatMap() behaves when the first value of a sequence maps to an empty sequence", t => {
  const seq = Sequence.from([0, 1, 2, 3]).flatMap(n =>
    Sequence.from(new Array(n).fill(n))
  );

  t.deepEqual([...seq], [1, 2, 2, 3, 3, 3]);
});

test("#flatMap() behaves when a singleton sequence maps to an empty sequence", t => {
  const seq = Sequence.from([1]).flatMap(() => Sequence.empty());

  t.deepEqual([...seq], []);
});

test("#reduce() reduces a sequence of values to a single value", t => {
  const sum = Sequence.from([1, 2, 3, 4]).reduce((acc, n) => acc + n, 0);

  t.equal(sum, 10);
});

test("#some() returns true if at least one value of a sequence satisfies a predicate", t => {
  const seq = Sequence.from([1, 2, 3, 4]);

  t(seq.some(n => n % 2 === 0));
});

test("#some() returns false if no value of a sequence satisfies a predicate", t => {
  const seq = Sequence.from([1, 3, 5, 7]);

  t(!seq.some(n => n % 2 === 0));
});

test("#some() returns false when a sequence is empty", t => {
  const seq = Sequence.empty<number>();

  t(!seq.some(n => n % 2 === 0));
});

test("#every() returns true if all values of a sequence satisfy a predicate", t => {
  const seq = Sequence.from([2, 4, 6, 8]);

  t(seq.every(n => n % 2 === 0));
});

test("#every() returns false if at least one value of a sequence does not satisfy a predicate", t => {
  const seq = Sequence.from([2, 4, 6, 7]);

  t(!seq.every(n => n % 2 === 0));
});

test("#every() returns true when a sequence is empty", t => {
  const seq = Sequence.empty<number>();

  t(seq.every(n => n % 2 === 0));
});

test("#filter() filters the values of a sequence according to a predicate", t => {
  const seq = Sequence.from([1, 2, 3, 4]).filter(n => n % 2 === 0);

  t.deepEqual([...seq], [2, 4]);
});

test("#filter() behaves when a singleton sequence does not satisfy a predicate", t => {
  const seq = Sequence.from([1]).filter(n => n % 2 === 0);

  t.deepEqual([...seq], []);
});

test("#equals() checks if two sequences are equal", t => {
  const a = Sequence.from([1, 2, 3, 4]);
  const b = Sequence.from([1, 2, 3, 4]);
  const c = Sequence.from([2, 3, 4, 5]);

  t(a.equals(b));
  t(!a.equals(c));
  t(!a.equals([1, 2, 3, 4]));
});

test("#equals() does not overflow for long sequences", t => {
  const a = Sequence.from(zeroes(100000));
  const b = Sequence.from(zeroes(100000));

  t(a.equals(b));
});

test("#reverse() reverses the values of a sequence", t => {
  const seq = Sequence.from([1, 2, 3, 4]).reverse();

  t.deepEqual([...seq], [4, 3, 2, 1]);
});

test("#join() joins the values of a sequence to a string", t => {
  const seq = Sequence.from(["foo", "bar", "baz"]);

  t.equal(seq.join("-"), "foo-bar-baz");
});

test("#toArray() constructs an array representation of a sequence", t => {
  const seq = Sequence.from([1, 2, 3, 4]);

  t.deepEqual(seq.toArray(), [1, 2, 3, 4]);
});

test("#toJSON() constructs a JSON representation of a sequence", t => {
  const seq = Sequence.from([1, 2, 3, 4]);

  t.deepEqual(seq.toJSON(), [1, 2, 3, 4]);
});

test("#toString() constructs a string representation of a sequence", t => {
  const seq = Sequence.from([1, 2, 3, 4]);

  t.deepEqual(seq.toString(), "Sequence [ 1, 2, 3, 4 ]");
});
