---
"@siteimprove/alfa-test": minor
---

**Added:** Test can now accept a `Controller` to generate random tests.

- The `assertion` function that is passed to `test(name, assertion)` receives additional `rng` and `seed` parameters. The `rng` is a function `() => number`. The `seed` was used to initialize the Random Number Generator, can be used for better displaying errors and for re-playability.
- The `test` function itself accepts an optional `Controller` object which can be used to set the `seed` for the RNG, or to change the number of `iterations` to run the test (default one). The `Controller` object also accepts a `wrapper` function of type `(iteration: number, rng: RNG) => RNG` that can be used for introspection. 

The provided `rng` function is guaranteed to generate the same sequence of numbers on sequential calls, if the same seed is provided by the controller. If no seed is provided, a random one will be used.

By default, each test is only run once. Use the `Controller` object to change the number of iterations.

Tests that make use of the RNG are encouraged to print the seed in their error message in order to allow re-playability and investigation by feeding the failing seed back to the test.

For re-playability, use the `Controller` parameter to select the seed to use (which guarantees the exact same sequence of numbers is produced), and to introspect on fine details by wrapping the RNG, e.g., 

```typescript
function wrapper(iteration: number, rng: RNG): RNG {
  return () => {
    const res = rng();
    console.log(`On iteration ${iteration}, I generated ${res}`);
    return res;
  }
}
```
