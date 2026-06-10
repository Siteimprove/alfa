---
"@siteimprove/alfa-future": minor
---

**Breaking:** The `@siteimprove/alfa-future` package is now deprecated.

The `Future` layer on top of native `Promise` was making less and less sense with the availability of top-level `await`.

Migration for main functions:

- Replace `Future.now` with `Promise.resolve`
- Replace `Future#map` and `Future#flatMap` with `Promise#then` (e.g. `foo.map(value => f(value))` becomes `foo.then(value => f(value))`.
- Replace `Future.traverse` with `Promise.all` and a custome mapper, e.g. `Future.traverse(iterable, mapper)` becomes `Promise.all(iterable.map(mapper))`.
