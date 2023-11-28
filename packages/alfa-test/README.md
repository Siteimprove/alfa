# Alfa test

Thanks to the referential transparency ensured by [ADR 6](../../docs/architecture/decisions/adr-006.md), unit test of Alfa code is usually very easy, simply comparing the actual result with the expected one (often as their serialisation), without need for complex setup, mocks, or other test tricks.

We're therefore implementing a very lightweight wrapper for tests.

```typescript
import { test } from "@siteimprove/alfa-test";

test("My test", (t) => {
  const actual = …;

  t.deepEqual(actual.toJSON(), { type: …, …})
});
```

## Property testing

Sometimes, it is convenient to generate random tests with random values. The `alfa-test` library is offering test controller to handle that.

- The `assertion` function that is passed to `test(name, assertion)` receives additional `rng` and `seed` parameters. The `rng` is a function `() => number`. The `seed` was used to initialize the Random Number Generator, can be used for better displaying errors and for re-playability.
- The `test` function itself accepts an optional `Controller` object which can be used to set the `seed` for the RNG, or to change the number of `iterations` to run the test (default to 1 since most tests are not random tests). The `Controller` object also accepts a `wrapper` function of type `(iteration: number, rng: RNG) => RNG` that can be used to turn the random numbers into useful data, or for introspection.

The provided `rng` function is guaranteed to generate the same sequence of numbers on sequential calls, if the same seed is provided by the controller. If no seed is provided, a random one will be used.

By default, each test is only run once. Use the `Controller` object to change the number of iterations.

Tests that make use of the RNG are encouraged to print the seed in their error message in order to allow re-playability and investigation by feeding the failing seed back to the test.

For re-playability, use the `Controller` parameter to select the seed to use (which guarantees the exact same sequence of numbers is produced), and to introspect on fine details by wrapping the RNG, e.g.,

```typescript
/**
 * Return a random number between 0 and 100 (inclusive).
 * Print the generated number, as well as the iteration number (use for debugging).
 */
function wrapper(iteration: number, rng: RNG): RNG {
  return () => {
    const res = rng();
    console.log(`On iteration ${iteration}, I generated ${res}`);
    return res * 100;
  };
}

test(
  "Sum computes the sum of two numbers",
  (t, rng, seed) => {
    // These use the post-wrapper RNG.
    const a = rng();
    const b = rng();
    // Print the seed in error message to allow introspection.
    const actual = sum(a, b, `Failed with seed ${seed}`);

    t.deepEqual(actual, a + b);
  },
  {
    wrapper,
    iterations: 100,
    // Set the seed for debugging, if you want to replay the same sequence of numbers.
    seed: 1234,
  },
);
```
