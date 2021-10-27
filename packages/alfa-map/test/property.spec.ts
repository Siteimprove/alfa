import { test } from "@siteimprove/alfa-test";

import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";

import { Map } from "../src/map";

/**
 * In order to do correct property based testing on Map (and hash tables), we
 * need:
 * * a seedable Pseudo-Random Numbers Generator, so we can re-use the seed to
 *   investigate problems;
 * * full control over the hashes of the keys, notably not relying on
 *   Hash.writeObject since the objects list might be "polluted" by previous
 *   actions
 *
 * The PRNG doesn't need to be very good (i.e. not cryptographic-grade). We also
 * wants the hashes to be both among a relatively small set (so that collisions
 * are likely and can be tested without huge number of items); and relatively
 * spread over the space so that Sparses are frequent and can be tested.
 *
 * 16 bits entropy seems a nice number since it leaves room for ~65,000 keys. By
 * making runs of 1000 keys, collisions are very likely to happen and there
 * is a relatively small number of iterations so tests don't run forever…
 *
 * We also need to output the failing seed systematically to allow investigation
 * in case of problems…
 *
 * Since #has looks for keys using hashes while Iterable.includes(map.keys())
 * is iterating through the keys without using hashes, both are systematically
 * used in tests as a way to ensure that no hash somehow becomes unreachable.
 */

/**
 * PRNG taken from
 * {@link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript}
 */

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Turning a float between 0 and 1 into a 32 bits int, and keeping only
 * 16 bits to reduce entropy while keeping good coverage of the space…
 */

function makeInt(x: number): number {
  return Math.floor(x * 2 ** 32) & 0b01010101010101010101010101010101;
}

interface Key {
  id: number;
  equals: (value: unknown) => boolean;
  hash: (hash: Hash) => void;
}

function key(id: number): Key {
  const self = {
    id: id,

    equals(value: unknown): boolean {
      return value === self;
    },

    hash(hash: Hash): void {
      hash.writeNumber(id);
    },
  };

  return self;
}

function randKey(rng: () => number): () => Key {
  return () => key(makeInt(rng()));
}

test(`#add and #delete behave when used in bulk`, (t) => {
  const iterations = 1000;
  const seed = Math.random();
  const rng = mulberry32(seed);
  const keyGen = randKey(rng);

  let map: Map<Key, boolean> = Map.empty();
  const keys: Array<Key> = [];

  // Adding elements
  for (let i = 0; i < iterations; i++) {
    const key = keyGen();

    t.deepEqual(map.size, i, `Pre-add map.size() fails with seed ${seed}`);
    t.deepEqual(
      map.has(key),
      false,
      `Pre-add map.has() fails with seed ${seed}`
    );
    t.deepEqual(
      Iterable.includes(map.keys(), key),
      false,
      `Pre-add includes fails with seed ${seed}`
    );

    map = map.set(key, true);
    keys.push(key);

    t.deepEqual(map.size, i + 1, `Post-add map.size() fails with seed ${seed}`);
    t.deepEqual(
      map.has(key),
      true,
      `Post-add map.has() fails with seed ${seed}`
    );
    t.deepEqual(
      Iterable.includes(map.keys(), key),
      true,
      `Post-add includes fails with seed ${seed}`
    );
  }

  // Removing those elements. Note that the keys array keep them in an order
  // fairly different from the #keys() enumeration (which is essentially
  // depth-first order in the Map, hence depends on hashes).
  // Hopefully, this creates enough entropy to test various scenarios.
  for (let i = iterations; i > 0; i--) {
    const key = keys[iterations - i];
    t.deepEqual(map.size, i, `Pre-delete map.size() fails with seed ${seed}`);
    t.deepEqual(
      map.has(key),
      true,
      `Pre-delete map.has() fails with seed ${seed}`
    );
    t.deepEqual(
      Iterable.includes(map.keys(), key),
      true,
      `Pre-delete includes fails with seed ${seed}`
    );

    map = map.delete(key);

    t.deepEqual(
      map.size,
      i - 1,
      `Post-delete map.size() fails with seed ${seed}`
    );
    t.deepEqual(
      map.has(key),
      false,
      `Post-delete map.has() fails with seed ${seed}`
    );
    t.deepEqual(
      Iterable.includes(map.keys(), key),
      false,
      `Post-delete includes fails with seed ${seed}`
    );
  }
});
