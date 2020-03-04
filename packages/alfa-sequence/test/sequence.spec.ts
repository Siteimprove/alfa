import { test } from "@siteimprove/alfa-test";

import { Lazy } from "@siteimprove/alfa-lazy";
import { Sequence } from "../src/sequence";

const array = (length: number) => new Array(length).fill(0).map((_, i) => i);

const seq = Sequence.from([1, 2, 3, 4]);

test("#size gets the size of a sequence", t => {
  t.equal(seq.size, 4);
});

test("#isEmpty() returns true if a sequence is empty", t => {
  t(Sequence.empty().isEmpty());
});

test("#isEmpty() returns false if a sequence is not empty", t => {
  t(!Sequence.from([1, 2, 3, 4]).isEmpty());
});

test("#map() applies a function to each value of a sequence", t => {
  t.deepEqual([...seq.map(n => n * 2)], [2, 4, 6, 8]);
});

test("#map() does not overflow for long chains", t => {
  let seq = Sequence.from([0]);

  for (let i = 0; i < 100000; i++) {
    seq = seq.map(n => n + 1);
  }

  t.deepEqual([...seq], [100000]);
});

test("#map() does not overflow for long sequences", t => {
  const seq = Sequence.from(array(100000)).map(n => n + 1);

  t.deepEqual(
    [...seq],
    array(100000).map(n => n + 1)
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
  t.deepEqual(
    [...seq.flatMap(n => Sequence.from([n, n]))],
    [1, 1, 2, 2, 3, 3, 4, 4]
  );
});

test("#flatMap() behaves when the first value of a sequence maps to an empty sequence", t => {
  t.deepEqual(
    [...seq.flatMap(n => Sequence.from(array(n)))],
    [0, /**/ 0, 1, /**/ 0, 1, 2, /**/ 0, 1, 2, 3]
  );
});

test("#flatMap() behaves when a singleton sequence maps to an empty sequence", t => {
  const seq = Sequence.from([1]).flatMap(() => Sequence.empty());

  t.deepEqual([...seq], []);
});

test("#reduce() reduces a sequence of values to a single value", t => {
  t.equal(
    seq.reduce((acc, n) => acc + n, 0),
    10
  );
});

test("#some() returns true if at least one value of a sequence satisfies a predicate", t => {
  t(seq.some(n => n === 1));
});

test("#some() returns false if no value of a sequence satisfies a predicate", t => {
  t(!seq.some(n => n > 4));
});

test("#some() returns false when a sequence is empty", t => {
  const seq = Sequence.empty<number>();

  t(!seq.some(n => n === 0));
});

test("#every() returns true if all values of a sequence satisfy a predicate", t => {
  t(seq.every(n => n < 5));
});

test("#every() returns false if at least one value of a sequence does not satisfy a predicate", t => {
  t(!seq.every(n => n === 1));
});

test("#every() returns true when a sequence is empty", t => {
  const seq = Sequence.empty<number>();

  t(seq.every(n => n === 0));
});

test("#filter() filters the values of a sequence according to a predicate", t => {
  t.deepEqual([...seq.filter(n => n % 2 === 0)], [2, 4]);
});

test("#filter() behaves when a singleton sequence does not satisfy a predicate", t => {
  const seq = Sequence.from([1]).filter(n => n % 2 === 0);

  t.deepEqual([...seq], []);
});

test("#find() finds the first value of a sequence that satisfies a predicate", t => {
  t.equal(seq.find(n => n % 2 === 0).get(), 2);
});

test("#find() returns none when no value of a sequence satisfies a predicate", t => {
  t(seq.find(n => n > 4).isNone());
});

test("#count() counts the number of values of a sequence that satisfy a predicate", t => {
  t.equal(
    seq.count(n => n % 2 === 0),
    2
  );
});

test("#get() returns the value at a given index of a sequence", t => {
  t.equal(seq.get(0).get(), 1);
  t.equal(seq.get(3).get(), 4);
});

test("#get() returns none when an index is out of bounds", t => {
  t(seq.get(5).isNone());
  t(seq.get(-1).isNone());
});

test("#first() returns the first value of a sequence", t => {
  t.equal(seq.first().get(), 1);
});

test("#first() returns none when a sequence is empty", t => {
  const seq = Sequence.empty<number>();

  t(seq.first().isNone());
});

test("#last() returns the last value of a sequence", t => {
  t.equal(seq.last().get(), 4);
});

test("#last() returns none when a sequence is empty", t => {
  const seq = Sequence.empty<number>();

  t(seq.last().isNone());
});

test("#take() takes a given number of values from a sequence", t => {
  t.deepEqual([...seq.take(2)], [1, 2]);
});

test("#takeWhile() takes values from a sequence while they satisfy a predicate", t => {
  t.deepEqual([...seq.takeWhile(n => n < 4)], [1, 2, 3]);
});

test("#takeUntil() takes values from a sequence until they satisfy a predicate", t => {
  t.deepEqual([...seq.takeUntil(n => n === 4)], [1, 2, 3]);
});

test("#skip() skips a number of values from a sequence", t => {
  t.deepEqual([...seq.skip(2)], [3, 4]);
});

test("#skipWhile() skips values from a sequence while they satisfy a predicate", t => {
  t.deepEqual([...seq.skipWhile(n => n < 4)], [4]);
});

test("#skipUntil() skips values from a sequence until they satisfy a predicate", t => {
  t.deepEqual([...seq.skipUntil(n => n === 4)], [4]);
});

test("#rest() returns a sequence with all but the first value of a sequence", t => {
  t.deepEqual([...seq.rest()], [2, 3, 4]);
});

test("#slice() returns a slice of a sequence", t => {
  t.deepEqual([...seq.slice(1, 3)], [2, 3]);
});

test("#reverse() reverses the values of a sequence", t => {
  t.deepEqual([...seq.reverse()], [4, 3, 2, 1]);
});

test("#join() joins the values of a sequence to a string", t => {
  const seq = Sequence.from(["foo", "bar", "baz"]);

  t.equal(seq.join("-"), "foo-bar-baz");
});

test("#equals() checks if two sequences are equal", t => {
  t(seq.equals(Sequence.from([1, 2, 3, 4])));
  t(!seq.equals(Sequence.from([2, 3, 4, 5])));
  t(!seq.equals([1, 2, 3, 4]));
});

test("#equals() does not overflow for long sequences", t => {
  t(Sequence.from(array(100000)).equals(Sequence.from(array(100000))));
});

test("#toArray() constructs an array representation of a sequence", t => {
  t.deepEqual(seq.toArray(), [1, 2, 3, 4]);
});

test("#toJSON() constructs a JSON representation of a sequence", t => {
  t.deepEqual(seq.toJSON(), [1, 2, 3, 4]);
});

test("#toString() constructs a string representation of a sequence", t => {
  t.deepEqual(seq.toString(), "Sequence [ 1, 2, 3, 4 ]");
});
