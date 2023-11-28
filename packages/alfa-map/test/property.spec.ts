import { RNG, test } from "@siteimprove/alfa-test";

import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";

import { Map } from "../src/map";

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

function wrapper(rng: RNG<number>): RNG<Key> {
  return () => key(makeInt(rng()));
}

test<Key>(
  `#add and #delete behave when used in bulk`,
  (t, rng, seed) => {
    // How many elements are we adding/removing in each iteration of the test?
    const size = 1000;

    let map: Map<Key, boolean> = Map.empty();
    const keys: Array<Key> = [];

    // Adding elements
    for (let i = 0; i < size; i++) {
      const key = rng();

      t.deepEqual(map.size, i, `Pre-add map.size() fails with seed ${seed}`);
      t.deepEqual(
        map.has(key),
        false,
        `Pre-add map.has() fails with seed ${seed}`,
      );
      t.deepEqual(
        Iterable.includes(map.keys(), key),
        false,
        `Pre-add includes fails with seed ${seed}`,
      );

      map = map.set(key, true);
      keys.push(key);

      t.deepEqual(
        map.size,
        i + 1,
        `Post-add map.size() fails with seed ${seed}`,
      );
      t.deepEqual(
        map.has(key),
        true,
        `Post-add map.has() fails with seed ${seed}`,
      );
      t.deepEqual(
        Iterable.includes(map.keys(), key),
        true,
        `Post-add includes fails with seed ${seed}`,
      );
    }

    // Removing those elements. Note that the keys array keep them in an order
    // fairly different from the #keys() enumeration (which is essentially
    // depth-first order in the Map, hence depends on hashes).
    // Hopefully, this creates enough entropy to test various scenarios.
    for (let i = size; i > 0; i--) {
      const key = keys[size - i];
      t.deepEqual(map.size, i, `Pre-delete map.size() fails with seed ${seed}`);
      t.deepEqual(
        map.has(key),
        true,
        `Pre-delete map.has() fails with seed ${seed}`,
      );
      t.deepEqual(
        Iterable.includes(map.keys(), key),
        true,
        `Pre-delete includes fails with seed ${seed}`,
      );

      map = map.delete(key);

      t.deepEqual(
        map.size,
        i - 1,
        `Post-delete map.size() fails with seed ${seed}`,
      );
      t.deepEqual(
        map.has(key),
        false,
        `Post-delete map.has() fails with seed ${seed}`,
      );
      t.deepEqual(
        Iterable.includes(map.keys(), key),
        false,
        `Post-delete includes fails with seed ${seed}`,
      );
    }
  },
  { wrapper },
);
