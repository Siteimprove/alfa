# ADR 17: Use mutable `Cache` with weak references for memoization

## Context

Some values take time to compute and are needed in several places. In our case, this mostly includes CSS cascaded and computed values; the accessibility tree; or DOM tree traversal.

There is usually a tradeoff between recomputing these values upon need (takes more time), and storing them once and for all (takes more space). In many cases, recomputing them upon need is simply not realistic in terms of performance. So we need a way to store them. Since we are never sure _which_ of these values will be needed, we do not want to compute everything upfront but only do it when they are actually needed. This is commonly known as [_memoization_](https://en.wikipedia.org/wiki/Memoization).

Memoization is possible because of the [referential transparency](https://en.wikipedia.org/wiki/Referential_transparency) brought to us by [ADR 6](./adr-006.md).

Memoization brings a risk of memory leak, by storing too much and keeping that information forever. We must take care to keep it as small as possible. It is not decidable whether a given value will be needed again, but there are still many cases where we can be sure it won't be needed again.

## Decision

We will implement a cache system built on JavaScript's `WeakMap` to leverage the garbage collector.

Caches will be mutable by side effect since they need to be persistent between calls to the same function.

When getting a cached value, we will provide a `ifMissing` function to compute it in case of cache miss; this let us use caches in a way that preserves referential transparency.

## Status

Accepted.

## Consequences

Repeated computations are avoided and the overall performances are much better.

Since caches are mutable, we must take care to not break [ADR 6](./adr-006.md). This means that `Cache` should always be local to their scope (usually, a file or namespace), and never be passed around to other parts of the code.

Since caches are built on `WeakMap`, their keys are only weakly referenced. Therefore, values are automatically deleted by the garbage collector when the corresponding key is deleted. Notably, when an audit is done and the corresponding `Document` is discarded, all associated cached values are also discarded. While it may be possible in some cases to delete values earlier, this leaves the burden of memory management to the garbage collector and greatly eases writing code. Developers do not need to care about fine-grained memory management of caches.

In order to keep referential transparency for cache access, the preferred way to use them is to have a single call to `cache.get(key, ifMissing)`. By never manually setting a value, and by always using the same `ifMissing` function, we ensure that a given key-value association may only come from a single place in the code. If `ifMissing` has itself referential transparency, the full call has.

In short, caches are powerful optimization tools, but we must take care to use them properly in order to maintain good code quality.
