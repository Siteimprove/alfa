# Alfa Sequence

A lazy, immutable sequence implementation for functional programming in TypeScript. Sequences provide efficient lazy evaluation, automatic result caching, and full replayability for working with potentially infinite or large data sets.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Laziness Mechanics](#laziness-mechanics)
- [Caching and Replay Behavior](#caching-and-replay-behavior)
- [Performance Characteristics](#performance-characteristics)
- [Common Patterns](#common-patterns)
- [Common Pitfalls and Gotchas](#common-pitfalls-and-gotchas)
- [API Reference](#api-reference)

## Overview

`Sequence<T>` is a lazy, immutable data structure similar to a list but with deferred evaluation. Unlike arrays, which eagerly compute all transformations immediately, sequences defer computation until values are actually needed.

### Key Features

- **Lazy Evaluation**: Operations like `map`, `filter`, and `flatMap` don't execute until values are consumed
- **Automatic Caching**: Once computed, values are cached for subsequent iterations
- **Full Replayability**: Iterate over the same sequence multiple times without recomputation
- **Immutable**: All operations return new sequences; original sequences are never modified
- **Stack Safe**: Uses trampolining to prevent stack overflows on long chains
- **Infinite Sequences**: Can represent infinite data structures that are consumed incrementally

### When to Use Sequence vs Array

**Use Sequence when:**

- Working with large or infinite data sets
- You want to defer computation until needed
- Chaining many transformations together
- Only consuming a subset of data (e.g., `take(10)` from millions)
- Building functional pipelines

**Use Array when:**

- Need random access (O(1) indexing)
- Working with small, fixed-size collections
- Interoperating with imperative code
- Need in-place mutations (though discouraged in Alfa)

## Quick Start

### Installation

```bash
yarn add @siteimprove/alfa-sequence
```

### Basic Usage

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

// Create a sequence from an array
const numbers = Sequence.from([1, 2, 3, 4, 5]);

// Transform lazily (no computation yet!)
const doubled = numbers.map((n) => n * 2);
const evens = doubled.filter((n) => n % 4 === 0);

// Computation happens when you consume values
evens.toArray(); // [4, 8]

// Create an empty sequence
const empty = Sequence.empty<number>();

// Create from a single value
const single = Sequence.of(42);

// Create with explicit tail
import { Lazy } from "@siteimprove/alfa-lazy";
const custom = Sequence.of(
  1,
  Lazy.of(() => Sequence.from([2, 3])),
);
```

### Chaining Operations

```typescript
const result = Sequence.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .filter((n) => n % 2 === 0) // [2, 4, 6, 8, 10]
  .map((n) => n * n) // [4, 16, 36, 64, 100]
  .take(3) // [4, 16, 36]
  .toArray();

console.log(result); // [4, 16, 36]
```

## Architecture

### The Cons/Nil Pattern

`Sequence<T>` is implemented as a discriminated union of two types:

- **`Cons<T>`**: A non-empty sequence containing a head value and a lazy tail
- **`Nil`**: An empty sequence (singleton)

This is the classic functional programming "cons list" structure:

```
Sequence [1, 2, 3, 4]:

┌──────┐      ┌──────┐      ┌──────┐      ┌──────┐
│ Cons │      │ Cons │      │ Cons │      │ Cons │
├──────┤      ├──────┤      ├──────┤      ├──────┤
│ head: 1     │ head: 2     │ head: 3     │ head: 4
│ tail: ───→  │ tail: ───→  │ tail: ───→  │ tail: ───→  Nil
│ (Lazy)      │ (Lazy)      │ (Lazy)      │ (Lazy)
└──────┘      └──────┘      └──────┘      └──────┘
```

### Internal Structure

```typescript
// Simplified conceptual structure
class Cons<T> {
  private _head: T; // Current value
  private _tail: Lazy<Sequence<T>>; // Rest of sequence (lazy!)
}

const Nil: Sequence<never>; // Singleton empty sequence
```

Key points:

1. **Head**: The first element (eagerly stored)
2. **Tail**: The rest of the sequence wrapped in `Lazy<T>` (deferred computation)
3. **Nil**: Terminates the sequence (no head, no tail)

### Immutability Guarantees

All operations on sequences follow Alfa's pure functional principles:

```typescript
const original = Sequence.from([1, 2, 3]);
const transformed = original.map((n) => n * 2);

// original is unchanged
original.toArray(); // [1, 2, 3]
transformed.toArray(); // [2, 4, 6]
```

Operations like `map`, `filter`, and `concat` create **new** `Cons` nodes with new lazy tails. The original sequence remains untouched, and all data is shared structurally where possible.

### Type Hierarchy

```typescript
interface Sequence<T> extends Collection.Indexed<T> {
  // Common sequence operations
}

class Cons<T> implements Sequence<T> {
  // Non-empty sequence implementation
}

interface Nil extends Sequence<never> {
  // Empty sequence implementation
}
```

Type guards are provided for narrowing:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

if (Sequence.isCons(seq)) {
  // seq is Cons<T>
  seq.first(); // Always returns Some<T>
}

if (Sequence.isNil(seq)) {
  // seq is Nil
  seq.isEmpty(); // Always true
}
```

## Laziness Mechanics

### How Lazy Evaluation Works

The key to Sequence's lazy behavior is the `Lazy<T>` wrapper around each tail reference. Understanding `Lazy<T>` is essential to understanding when computation happens.

#### The Lazy<T> Type

`Lazy<T>` from `@siteimprove/alfa-lazy` represents a deferred computation:

```typescript
class Lazy<T> {
  private _value: Trampoline<T>; // Suspended or computed value

  static of<T>(thunk: () => T): Lazy<T>; // Create lazy value
  static force<T>(value: T): Lazy<T>; // Create already-computed lazy value

  force(): T; // Compute (or return cached)
  map<U>(mapper: (value: T) => U): Lazy<U>; // Transform lazily
}
```

When you create a `Lazy` value with `Lazy.of(() => ...)`, the function is **not called immediately**. It's stored as a suspended computation. Only when you call `.force()` does the function execute.

#### Trampoline for Stack Safety

Internally, `Lazy<T>` uses `Trampoline<T>` to prevent stack overflows when building long chains of lazy operations:

```typescript
// Conceptual structure
type Trampoline<T> =
  | { kind: "done"; value: T } // Computed value
  | { kind: "suspended"; thunk: () => T }; // Pending computation
```

This allows sequences with thousands of chained `map` operations to execute without stack overflow.

### When Operations Execute

Sequence operations fall into three categories based on when they force evaluation:

#### 1. Non-Forcing Operations (Fully Lazy)

These operations **never** force the tail and execute **instantly**:

```typescript
const seq = Sequence.from([1, 2, 3, 4, 5]);

// None of these execute the mappers yet!
const step1 = seq.map((n) => n * 2); // O(1) - just wraps tail
const step2 = step1.filter((n) => n > 4); // O(1) - just wraps tail
const step3 = step2.map((n) => n - 1); // O(1) - just wraps tail

// Still no execution has happened!
```

**Non-forcing operations:**

- `map` - transforms values lazily
- `filter` - filters values lazily
- `flatMap` - flattens sequences lazily
- `collect` - applies Option-returning function lazily
- `reject` - inverse filter, lazy
- `take` - limits sequence lazily
- `skip` - skips elements lazily
- `concat` - appends sequences lazily
- `zip` - pairs sequences lazily
- `distinct` - removes duplicates lazily
- `prepend` - adds to front (O(1))

**How they work:**

```typescript
// Simplified map implementation
class Cons<T> {
  map<U>(mapper: (value: T) => U): Cons<U> {
    return new Cons(
      mapper(this._head), // Transform head immediately
      this._tail.map(
        (
          tail, // Wrap tail transformation in Lazy
        ) => tail.map(mapper), // Recursive lazy call
      ),
    );
  }
}
```

Each operation creates a new `Cons` with a transformed head and a **lazy tail** that will apply the operation when forced.

#### 2. Partially Forcing Operations

These operations force **only as much as needed**:

```typescript
const seq = Sequence.from([1, 2, 3, 4, 5]).map((n) => {
  console.log(`mapping ${n}`);
  return n * 2;
});

// Only forces first element
seq.first();
// Output: "mapping 1"

// Forces up to matching element
seq.find((n) => n > 4);
// Output: "mapping 1", "mapping 2", "mapping 3"

// Forces exactly 2 elements
seq.take(2).toArray();
// Output: "mapping 1", "mapping 2"
```

**Partially forcing operations:**

- `first()` - forces head only
- `find(pred)` - forces until predicate matches
- `some(pred)` - forces until predicate matches (short-circuits)
- `every(pred)` - forces until predicate fails (short-circuits)
- `get(n)` - forces up to index n
- `take(n).toArray()` - forces exactly n elements
- `reduceWhile(pred, ...)` - forces while predicate holds
- `takeWhile(pred)` - forces while predicate holds (when consumed)

#### 3. Fully Forcing Operations

These operations **must** force the entire sequence:

```typescript
const seq = Sequence.from([1, 2, 3, 4, 5]).map((n) => n * 2);

// Forces entire sequence
seq.size; // Must count all elements
seq.last(); // Must traverse to end
seq.toArray(); // Materializes everything
seq.reverse(); // Must see all elements
seq.sort(); // Must see all elements
```

**Fully forcing operations:**

- `size` - counts all elements
- `last()` - traverses to end
- `toArray()` - materializes to array
- `toJSON()` - materializes to JSON
- `reverse()` - reverses entire sequence
- `sort()` / `sortWith()` - sorts entire sequence
- `join()` - concatenates to string
- `reduce()` - full reduction
- `count(pred)` - counts matching elements
- `every(pred)` when all match - checks all elements
- `equals()` - compares all elements

### Visual Example: Lazy Evaluation Flow

```
Create:     Sequence.from([1, 2, 3, 4, 5])
            │
            └─→ Cons(1, Lazy) → Cons(2, Lazy) → Cons(3, Lazy) → ...
                    ↑ evaluated        ↑ not evaluated yet

Map:        .map(n => n * 2)
            │
            └─→ Cons(2, Lazy) → ??? (wrapped in new Lazy)
                    ↑ head transformed
                    ↑ tail wrapped, not forced

Filter:     .filter(n => n > 2)
            │
            └─→ Skip Cons(2, ...)
                Continue searching...
                Cons(4, Lazy) → ??? (more wrapped Lazy)
                     ↑ first match found
                     ↑ tail still not forced

Consume:    .take(2).toArray()
            │
            └─→ Force next matching element:
                Cons(6, Lazy) → [4, 6]
                     ↑ second match
                     ↑ stop here, rest stays lazy
```

### Demonstrating Lazy Behavior

```typescript
// Test from sequence.spec.ts demonstrating laziness
const seq = Sequence.of(
  1,
  Lazy.of(() => {
    throw new Error("The tail was forced!");
  }),
);

// This does NOT throw, because map doesn't force the tail
const mapped = seq.map((n) => n + 1);

// This DOES NOT throw either - still lazy
const doubled = mapped.map((n) => n * 2);

// Only forcing the first element is safe
doubled.first(); // Some(4) - no error!

// But this WOULD throw:
// doubled.toArray(); // Error: "The tail was forced!"
```

### Building Infinite Sequences

Laziness enables infinite sequences:

```typescript
// Infinite sequence of natural numbers
function naturals(start = 0): Sequence<number> {
  return Sequence.of(
    start,
    Lazy.of(() => naturals(start + 1)),
  );
}

// Only computes what we need
naturals().take(5).toArray(); // [0, 1, 2, 3, 4]

// Can chain operations on infinite sequences
naturals()
  .filter((n) => n % 2 === 0) // Even numbers
  .map((n) => n * n) // Squared
  .take(5) // First 5
  .toArray(); // [0, 4, 16, 36, 64]
```

## Caching and Replay Behavior

One of Sequence's most important features is its caching behavior. Understanding when and how values are cached is critical for performance optimization.

### Automatic Result Caching

**Key Insight: Once a `Lazy<T>` value is forced, it caches the result permanently.**

When you call `Lazy.force()`, it:

1. Executes the suspended computation (if not already computed)
2. Replaces the suspended `Trampoline` with a completed `Trampoline` containing the value
3. Returns the cached value on all future `force()` calls

```typescript
// From alfa-lazy/src/lazy.ts (simplified)
class Lazy<T> {
  force(): T {
    if (this._value.isSuspended()) {
      // Compute and cache permanently
      this._value = Trampoline.done(this._value.run());
    }
    return this._value.run();
  }
}
```

### Sequences Are Fully Replayable

Because of caching, you can iterate over the same sequence multiple times without recomputation:

```typescript
let callCount = 0;

const seq = Sequence.from([1, 2, 3]).map((n) => {
  callCount++;
  console.log(`Computing ${n} * 2`);
  return n * 2;
});

// First iteration - values are computed
console.log("First iteration:");
for (const value of seq) {
  console.log(value);
}
// Output:
// Computing 1 * 2
// 2
// Computing 2 * 2
// 4
// Computing 3 * 2
// 6

// Second iteration - values are cached!
console.log("\nSecond iteration:");
for (const value of seq) {
  console.log(value);
}
// Output:
// 2
// 4
// 6
// (No "Computing" messages!)

console.log(`\nTotal computations: ${callCount}`); // 3 (not 6!)
```

### Caching Granularity

Caching happens **at the `Lazy<T>` wrapper level**, which wraps each tail reference.

```
Original sequence after first iteration:

Cons(2, Lazy[cached]) → Cons(4, Lazy[cached]) → Cons(6, Lazy[cached]) → Nil
        ↑ cached               ↑ cached               ↑ cached
```

### Transformation Chains Create New Lazy Wrappers

**Important**: Each transformation operation creates **new** `Cons` nodes with **new** `Lazy` wrappers. This means:

```typescript
const base = Sequence.from([1, 2, 3]);

// First transformation
const doubled = base.map((n) => n * 2);

// Second transformation creates NEW lazy wrappers
const plusOne = doubled.map((n) => n + 1);

// First iteration of plusOne: computes both transformations
plusOne.toArray(); // Executes: n * 2, then result + 1

// Second iteration of plusOne: cached!
plusOne.toArray(); // Uses cached values
```

However, if you create a **new** transformation chain, it creates **new** lazy wrappers:

```typescript
const base = Sequence.from([1, 2, 3]);

// Each call creates a new transformation chain
function transform(seq: Sequence<number>) {
  return seq.map((n) => n * 2).map((n) => n + 1);
}

const result1 = transform(base);
result1.toArray(); // Computes transformations

const result2 = transform(base);
result2.toArray(); // Computes transformations AGAIN (new chain!)

// These are different objects:
result1 !== result2; // true
```

### Memory Implications

Cached values are **retained in memory** as long as the sequence is referenced:

```typescript
// This sequence keeps all computed values in memory
const large = Sequence.from(Array.from({ length: 1_000_000 }, (_, i) => i))
  .map((n) => n * 2)
  .filter((n) => n % 3 === 0);

// First iteration: computes and caches
large.forEach((n) => {
  /* process */
});

// Values stay in memory until 'large' is garbage collected
```

For large datasets where you only iterate once, consider:

1. **Don't cache**: Use the sequence once then discard
2. **Materialize selectively**: Use `take()` before materializing
3. **Stream processing**: Process in chunks

### Caching Behavior Summary

| Scenario                         | Cached?    | Performance               |
| -------------------------------- | ---------- | ------------------------- |
| Iterate same sequence twice      | ✅ Yes     | Fast (no recompute)       |
| Create new transformation chain  | ❌ No      | Recomputes each time      |
| Partially consume (e.g., `take`) | ⚠️ Partial | Only forced values cached |
| Force then re-force same `Lazy`  | ✅ Yes     | Instant (O(1))            |

### Best Practices for Caching

**Do:**

```typescript
// Create transformation pipeline once
const pipeline = source.map(transform1).filter(predicate).map(transform2);

// Iterate multiple times - cached!
pipeline.forEach(process1);
pipeline.forEach(process2);
```

**Don't:**

```typescript
// Creating pipeline inside function
function getPipeline() {
  return source.map(transform1).filter(predicate).map(transform2);
}

// Each call creates new pipeline - no caching!
getPipeline().forEach(process1); // Computes
getPipeline().forEach(process2); // Computes AGAIN
```

### Visualizing Cache Behavior

```
Timeline of seq.map(f).filter(g).take(2).toArray():

Create:     Cons(x1, Lazy) → Cons(x2, Lazy) → ...
                 ↓ not forced yet

Iterate:    .map(f) wraps each tail
            Cons(f(x1), Lazy[map]) → Cons(f(x2), Lazy[map]) → ...
                        ↓ forced during iteration

            .filter(g) wraps again
            Cons(f(x1), Lazy[filter]) → ...
                        ↓ forced, checks g(f(x1))
                        ↓ matched, include

            .take(2) limits
            Force second element...
            Cons(f(x2), Lazy[filter]) → ...
                        ↓ forced, checks g(f(x2))
                        ↓ matched, include, stop

After:      Cons(f(x1), Lazy[CACHED]) → Cons(f(x2), Lazy[CACHED]) → ???
                                                                      ↑ never forced

Second iteration uses cached Lazy values!
```

## Performance Characteristics

Understanding the performance characteristics of Sequence operations helps you make informed decisions about when to use sequences vs arrays.

### Time Complexity

#### Creation Operations

| Operation                 | Time Complexity | Notes                              |
| ------------------------- | --------------- | ---------------------------------- |
| `Sequence.of(x)`          | O(1)            | Creates single-element sequence    |
| `Sequence.empty()`        | O(1)            | Returns singleton Nil              |
| `Sequence.from(array)`    | O(1)\*          | Lazy - wraps array without copying |
| `Sequence.from(iterable)` | O(1)\*          | Lazy - wraps iterator              |

\*_Deferred: Construction is O(1), but first iteration will traverse the source._

#### Transformation Operations (Lazy)

| Operation       | Construction | First Iteration | Subsequent Iterations |
| --------------- | ------------ | --------------- | --------------------- |
| `map(fn)`       | O(1)         | O(n)            | O(n) - cached         |
| `filter(pred)`  | O(1)         | O(n)            | O(n) - cached         |
| `flatMap(fn)`   | O(1)         | O(n × m)        | O(n × m) - cached     |
| `take(k)`       | O(1)         | O(k)            | O(k) - cached         |
| `skip(k)`       | O(1)         | O(k + m)        | O(k + m) - cached     |
| `concat(other)` | O(1)         | O(n + m)        | O(n + m) - cached     |
| `zip(other)`    | O(1)         | O(min(n, m))    | O(min(n, m)) - cached |

_n = sequence length, m = subsequence/other sequence length, k = skip/take count_

#### Access Operations

| Operation | Time Complexity | Notes                          |
| --------- | --------------- | ------------------------------ |
| `first()` | O(1)            | Always instant (head is eager) |
| `last()`  | O(n)            | Must traverse entire sequence  |
| `get(i)`  | O(i)            | Must traverse i elements       |
| `has(i)`  | O(i)            | Must traverse i elements       |

#### Aggregation Operations

| Operation     | Time Complexity | Notes                                  |
| ------------- | --------------- | -------------------------------------- |
| `size`        | O(n)            | Counts all elements                    |
| `toArray()`   | O(n)            | Materializes entire sequence           |
| `reduce()`    | O(n)            | Visits each element once               |
| `forEach()`   | O(n)            | Visits each element once               |
| `some(pred)`  | O(n)            | Worst case; short-circuits on match    |
| `every(pred)` | O(n)            | Worst case; short-circuits on mismatch |
| `find(pred)`  | O(n)            | Worst case; short-circuits on match    |

#### Expensive Operations

| Operation    | Time Complexity | Space Complexity | Notes                                   |
| ------------ | --------------- | ---------------- | --------------------------------------- |
| `reverse()`  | O(n)            | O(n)             | Creates array, then new sequence        |
| `sort()`     | O(n log n)      | O(n)             | Creates array, sorts, then new sequence |
| `sortWith()` | O(n log n)      | O(n)             | Creates array, sorts, then new sequence |

### Space Complexity

#### Memory Usage Patterns

```typescript
// Space: O(1) during construction (lazy)
const seq = Sequence.from([1, 2, 3, 4, 5])
  .map((n) => n * 2)
  .filter((n) => n > 4);

// Space: O(k) where k = elements forced
seq.take(2).toArray(); // Allocates space for 2 elements + overhead

// Space: O(n) - entire sequence forced and cached
seq.toArray(); // Allocates space for all elements + caching overhead
```

#### Caching Overhead

Each `Cons` node stores:

- Head value: size of `T`
- Lazy tail: reference + cached value (once forced)
- Object overhead: ~40-80 bytes per node (V8/Node.js)

**Example:**

```typescript
// Sequence of 1000 numbers
const seq = Sequence.from(Array.from({ length: 1000 }, (_, i) => i));

// Memory usage (approximate):
// - 1000 Cons nodes × ~60 bytes = ~60 KB overhead
// - 1000 numbers × 8 bytes = ~8 KB data
// - Total: ~68 KB (vs ~8 KB for raw array)
```

**Recommendation:** For small, fixed-size collections (<100 elements), prefer arrays unless you need laziness.

### Performance Comparison: Sequence vs Array

#### Scenario 1: Transform and Take Subset

```typescript
// Array: Eagerly computes everything, then takes 10
const arrayResult = [1, 2, 3, /* ... */ 1_000_000]
  .map((n) => n * 2) // Allocates 1M-element array
  .filter((n) => n % 3 === 0) // Allocates ~333K-element array
  .slice(0, 10); // Finally takes 10

// Sequence: Only computes 10 matching elements
const seqResult = Sequence.from([1, 2, 3, /* ... */ 1_000_000])
  .map((n) => n * 2) // O(1) - lazy
  .filter((n) => n % 3 === 0) // O(1) - lazy
  .take(10) // O(~15) - forces until 10 matches found
  .toArray();

// Winner: Sequence 🚀 (dramatically faster, less memory)
```

#### Scenario 2: Multiple Full Iterations

```typescript
const data = Array.from({ length: 10000 }, (_, i) => i);

// Array: Recomputes every time
function processArray() {
  const transformed = data.map((n) => n * 2); // Allocates 10K array
  transformed.forEach(op1); // O(n)
  data.map((n) => n * 2).forEach(op2); // Recomputes + allocates again!
}

// Sequence: Computes once, caches, replays
function processSequence() {
  const transformed = Sequence.from(data).map((n) => n * 2);
  transformed.forEach(op1); // O(n) - computes + caches
  transformed.forEach(op2); // O(n) - uses cache
}

// Winner: Depends on number of iterations
// - 1 iteration: Array (lower overhead)
// - 2+ iterations: Sequence (caching advantage)
```

#### Scenario 3: Random Access

```typescript
// Array: O(1) access
const arr = [1, 2, 3, 4, 5];
arr[3]; // Instant

// Sequence: O(i) access
const seq = Sequence.from([1, 2, 3, 4, 5]);
seq.get(3); // Must traverse 3 elements

// Winner: Array 🚀 (dramatically faster)
```

### When Sequences Excel

1. **Large pipelines with early termination**

   ```typescript
   // Only processes until 5 matches found
   hugeDataset.filter(expensive).map(transform).take(5).toArray();
   ```

2. **Infinite data sources**

   ```typescript
   // Would be impossible with arrays
   infiniteSequence().filter(predicate).take(100).toArray();
   ```

3. **Multiple iterations of expensive transformations**
   ```typescript
   // Computes once, iterates many times
   const processed = rawData.map(expensiveTransform);
   useCase1(processed);
   useCase2(processed);
   useCase3(processed);
   ```

### When Arrays Excel

1. **Random access patterns**
2. **Small collections (<100 elements)**
3. **Single-pass processing**
4. **Interop with imperative code**
5. **Need mutation** (though discouraged in Alfa)

### Performance Tips

**Materialize strategically:**

```typescript
// Bad: Forces entire large sequence
const all = hugeSeq.map(transform).toArray();
all.forEach(process);

// Good: Keep lazy until final consumption
hugeSeq.map(transform).forEach(process);
```

**Reuse computed sequences:**

```typescript
// Bad: Creates new pipeline each time
function getBad() {
  return source.map(f).filter(g);
}
getBad().forEach(op1); // Computes
getBad().forEach(op2); // Recomputes

// Good: Compute once, reuse
const good = source.map(f).filter(g);
good.forEach(op1); // Computes + caches
good.forEach(op2); // Uses cache
```

**Use take() for limits:**

```typescript
// Bad: Forces entire sequence, then slices
bigSeq.map(expensive).toArray().slice(0, 10);

// Good: Only forces 10 elements
bigSeq.map(expensive).take(10).toArray();
```

## Common Patterns

### Pattern 1: Infinite Sequences

Generate infinite data streams and consume them lazily:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";
import { Lazy } from "@siteimprove/alfa-lazy";

// Infinite sequence of natural numbers
function naturals(start = 0): Sequence<number> {
  return Sequence.of(
    start,
    Lazy.of(() => naturals(start + 1)),
  );
}

// Fibonacci sequence
function fibonacci(): Sequence<number> {
  function fib(a: number, b: number): Sequence<number> {
    return Sequence.of(
      a,
      Lazy.of(() => fib(b, a + b)),
    );
  }
  return fib(0, 1);
}

// Use infinite sequences safely with take()
naturals().take(10).toArray(); // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
fibonacci().take(10).toArray(); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Combine infinite sequences with transformations
naturals()
  .filter((n) => n % 2 === 0) // Even numbers only
  .map((n) => n * n) // Square them
  .take(5) // First 5
  .toArray(); // [0, 4, 16, 36, 64]
```

### Pattern 2: Pipeline Composition

Build reusable transformation pipelines:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";
import { Predicate } from "@siteimprove/alfa-predicate";

// Define reusable transformations
const { and } = Predicate;

const isEven = (n: number) => n % 2 === 0;
const isPositive = (n: number) => n > 0;
const square = (n: number) => n * n;
const double = (n: number) => n * 2;

// Compose pipelines
function processPipeline<T>(
  source: Sequence<T>,
  ...operations: Array<(seq: Sequence<any>) => Sequence<any>>
): Sequence<any> {
  return operations.reduce((seq, op) => op(seq), source);
}

const numbers = Sequence.from([-2, -1, 0, 1, 2, 3, 4, 5]);

const result = processPipeline(
  numbers,
  (seq) => seq.filter(and(isEven, isPositive)),
  (seq) => seq.map(square),
  (seq) => seq.map(double),
);

result.toArray(); // [8, 32, 50]
```

### Pattern 3: Early Termination

Avoid unnecessary computation by terminating early:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

// Find first element matching complex criteria
const users = Sequence.from(millionsOfUsers);

// Short-circuits after finding first match
const admin = users
  .filter((user) => user.role === "admin")
  .find((user) => user.active && user.permissions.includes("delete"));

// Only computes until finding 10 results
const topResults = hugeDataset
  .filter(expensivePredicate)
  .map(expensiveTransform)
  .take(10)
  .toArray(); // Stops after 10 matches

// Count until condition met
const indexOfFirst = sequence.countUntil((item) => item.id === targetId);
```

### Pattern 4: Memoized Transformations

Cache expensive transformations for reuse:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

class DataProcessor {
  private _transformed: Sequence<ProcessedData> | null = null;

  constructor(private readonly _raw: Sequence<RawData>) {}

  // Lazy computation, memoized result
  get transformed(): Sequence<ProcessedData> {
    if (this._transformed === null) {
      this._transformed = this._raw
        .map(expensiveTransform)
        .filter(validationCheck);
    }
    return this._transformed;
  }

  // Multiple operations reuse cached transformation
  analyze1() {
    return this.transformed.reduce(aggregation1, initial1);
  }

  analyze2() {
    return this.transformed.reduce(aggregation2, initial2);
  }
}
```

### Pattern 5: Chunked Processing

Process large sequences in chunks:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

function* chunks<T>(seq: Sequence<T>, size: number): Iterable<Sequence<T>> {
  let current = seq;
  while (!current.isEmpty()) {
    yield current.take(size);
    current = current.skip(size);
  }
}

// Process large dataset in chunks
const large = Sequence.from(millionItems);

for (const chunk of chunks(large, 1000)) {
  // Process 1000 items at a time
  processChunk(chunk.toArray());
}
```

### Pattern 6: Combining Sequences

Merge and combine multiple sequences:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

// Interleave two sequences
function interleave<T>(a: Sequence<T>, b: Sequence<T>): Sequence<T> {
  if (a.isEmpty()) return b;
  if (b.isEmpty()) return a;

  return Sequence.of(
    a.first().getUnsafe(),
    Lazy.of(() => interleave(b, a.rest())),
  );
}

const seq1 = Sequence.from([1, 2, 3]);
const seq2 = Sequence.from([10, 20, 30]);
interleave(seq1, seq2).toArray(); // [1, 10, 2, 20, 3, 30]

// Zip sequences together
const names = Sequence.from(["Alice", "Bob", "Charlie"]);
const ages = Sequence.from([30, 25, 35]);
const people = names.zip(ages).map(([name, age]) => ({ name, age }));

people.toArray();
// [
//   { name: "Alice", age: 30 },
//   { name: "Bob", age: 25 },
//   { name: "Charlie", age: 35 }
// ]

// Concat sequences
const combined = Sequence.from([1, 2, 3]).concat([4, 5, 6]).concat([7, 8, 9]);

combined.toArray(); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

### Pattern 7: Working with Option

Combine sequences with Option for safe operations:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";
import { Option, None } from "@siteimprove/alfa-option";

// collect() filters and transforms in one pass
const numbers = Sequence.from([-2, -1, 0, 1, 2, 3, 4, 5]);

const positiveSquares = numbers.collect((n) =>
  n > 0 ? Option.of(n * n) : None,
);

positiveSquares.toArray(); // [1, 4, 9, 16, 25]

// collectFirst() finds and transforms first match
const firstEvenSquare = numbers.collectFirst((n) =>
  n > 0 && n % 2 === 0 ? Option.of(n * n) : None,
);

firstEvenSquare.getOr(0); // 4
```

### Pattern 8: Deduplication and Grouping

Remove duplicates and group elements:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

// Remove duplicates
const withDupes = Sequence.from([1, 2, 2, 3, 3, 3, 4, 4, 4, 4]);
const unique = withDupes.distinct();
unique.toArray(); // [1, 2, 3, 4]

// Group by property
interface User {
  name: string;
  role: string;
}

const users = Sequence.from([
  { name: "Alice", role: "admin" },
  { name: "Bob", role: "user" },
  { name: "Charlie", role: "admin" },
]);

const byRole = users.groupBy((user) => user.role);
// Map {
//   "admin" => Sequence [{ name: "Alice", ... }, { name: "Charlie", ... }],
//   "user" => Sequence [{ name: "Bob", ... }]
// }

byRole.get("admin").map((admins) => admins.toArray());
```

### Pattern 9: Conditional Processing

Apply different transformations based on conditions:

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

const numbers = Sequence.from([1, 2, 3, 4, 5, 6]);

// Process odds and evens differently
const processed = numbers.flatMap(
  (n) =>
    n % 2 === 0
      ? Sequence.from([n, n]) // Duplicate evens
      : Sequence.of(n * 10), // Multiply odds by 10
);

processed.toArray(); // [10, 2, 2, 30, 4, 4, 50, 6, 6]

// Split into two sequences based on predicate
function partition<T>(
  seq: Sequence<T>,
  predicate: (value: T) => boolean,
): [Sequence<T>, Sequence<T>] {
  return [seq.filter(predicate), seq.reject(predicate)];
}

const [evens, odds] = partition(numbers, (n) => n % 2 === 0);
evens.toArray(); // [2, 4, 6]
odds.toArray(); // [1, 3, 5]
```

## Common Pitfalls and Gotchas

### Pitfall 1: Accidental Infinite Loops

**Problem:** Creating infinite sequences without proper termination.

```typescript
// DANGER: Infinite loop!
function badInfinite(): Sequence<number> {
  return Sequence.of(
    1,
    Lazy.of(() => badInfinite()),
  );
}

// This will hang forever:
// badInfinite().toArray(); // DON'T DO THIS

// This will also hang:
// badInfinite().forEach(console.log); // Never terminates
```

**Solution:** Always use `take()` or similar to limit infinite sequences:

```typescript
// Safe: Limits consumption
badInfinite().take(10).toArray(); // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

// Safe: Short-circuits on condition
badInfinite().find((n) => n === 1); // Some(1)
```

### Pitfall 2: Memory Leaks from Retained References

**Problem:** Keeping references to large sequences prevents garbage collection.

```typescript
class DataProcessor {
  private _cache: Sequence<LargeObject>[] = [];

  process(data: Array<LargeObject>) {
    // Each sequence caches all computed values
    const seq = Sequence.from(data).map(expensiveTransform);

    // Storing sequence retains ALL cached values in memory
    this._cache.push(seq);

    return seq.first();
  }
}

// After processing many datasets, memory usage grows unbounded!
```

**Solution:** Don't cache sequences unless you need replayability. Extract only what you need:

```typescript
class DataProcessor {
  private _cache: Array<ProcessedData> = [];

  process(data: Array<LargeObject>) {
    const seq = Sequence.from(data).map(expensiveTransform);

    // Only store what you need
    const result = seq.first().getUnsafe();
    this._cache.push(result);

    return result;
  }
}
```

### Pitfall 3: Recomputing Expensive Transformations

**Problem:** Creating transformation pipelines inside functions causes recomputation.

```typescript
function bad(source: Sequence<Data>) {
  // Creates NEW pipeline every call
  return source.map(expensive).filter(predicate);
}

const source = Sequence.from(largeDataset);

// Each call recomputes everything!
bad(source).forEach(op1); // Computes
bad(source).forEach(op2); // Recomputes
bad(source).forEach(op3); // Recomputes again
```

**Solution:** Create pipeline once, reuse multiple times:

```typescript
function good(source: Sequence<Data>) {
  // Create pipeline once outside repeated operations
  const pipeline = source.map(expensive).filter(predicate);

  // Reuse cached pipeline
  pipeline.forEach(op1); // Computes + caches
  pipeline.forEach(op2); // Uses cache
  pipeline.forEach(op3); // Uses cache

  return pipeline;
}
```

### Pitfall 4: Premature Materialization

**Problem:** Calling `toArray()` too early defeats laziness.

```typescript
// Bad: Forces entire sequence immediately
const materialized = hugeSequence.map(transform).filter(predicate).toArray(); // Allocates huge array

// Then only uses first 10
const subset = materialized.slice(0, 10);
```

**Solution:** Stay lazy as long as possible:

```typescript
// Good: Only forces 10 elements
const subset = hugeSequence
  .map(transform)
  .filter(predicate)
  .take(10) // Limits before materialization
  .toArray();
```

### Pitfall 5: Accessing `.size` on Large Sequences

**Problem:** The `size` property forces the entire sequence.

```typescript
const huge = Sequence.from(millionsOfItems).map(transform);

// Forces ALL items just to count them!
if (huge.size > 0) {
  // Oops, we just computed everything
}
```

**Solution:** Use `isEmpty()` or `first()` for existence checks:

```typescript
// Good: O(1) check
if (!huge.isEmpty()) {
  // No computation needed
}

// Or check for first element
if (huge.first().isSome()) {
  // Only forces first element
}
```

### Pitfall 6: Nested Sequence Operations in Loops

**Problem:** Creating sequences inside loops can cause performance issues.

```typescript
// Bad: Creates new sequence every iteration
for (const item of items) {
  const seq = Sequence.from(data)
    .map((x) => x * item)
    .filter((x) => x > threshold);

  process(seq.toArray()); // Recomputes entire pipeline each time
}
```

**Solution:** Move sequence creation outside loop if possible:

```typescript
// Good: Create sequence once
const baseSeq = Sequence.from(data);

for (const item of items) {
  const result = baseSeq
    .map((x) => x * item)
    .filter((x) => x > threshold)
    .toArray();

  process(result);
}

// Even better: Process without materializing
for (const item of items) {
  baseSeq
    .map((x) => x * item)
    .filter((x) => x > threshold)
    .forEach(processItem); // No array allocation
}
```

### Pitfall 7: Debugging Lazy Sequences

**Problem:** Side effects in lazy operations don't execute when you expect.

```typescript
// Trying to debug with console.log
const seq = Sequence.from([1, 2, 3]).map((n) => {
  console.log(`Mapping ${n}`); // Won't execute yet!
  return n * 2;
});

// No output yet - sequence is lazy!

// Output only appears when forced
seq.first(); // Logs: "Mapping 1"
```

**Solution:** Use `tee()` to observe sequences without consuming them:

```typescript
const seq = Sequence.from([1, 2, 3])
  .map((n) => n * 2)
  .tee((s) => console.log("Intermediate:", s.toArray()))
  .filter((n) => n > 2);

// Or force evaluation explicitly for debugging
const debug = seq.toArray();
console.log("Debug:", debug);
```

### Pitfall 8: Mutating Source Data

**Problem:** Mutating the source iterable breaks immutability guarantees.

```typescript
const array = [1, 2, 3, 4, 5];
const seq = Sequence.from(array);

// First iteration
seq.toArray(); // [1, 2, 3, 4, 5]

// Mutate source array
array.push(6);
array[0] = 100;

// Second iteration sees mutations!
seq.toArray(); // [100, 2, 3, 4, 5, 6] - UNEXPECTED!
```

**Solution:** Don't mutate source data, or copy it first:

```typescript
// Option 1: Don't mutate source
const array = [1, 2, 3, 4, 5];
const seq = Sequence.from(array);
// Never mutate 'array' after creating sequence

// Option 2: Copy source data
const seq = Sequence.from([...array]); // Copies array
// Now safe to mutate original 'array'
```

### Pitfall 9: Incorrect Type Narrowing

**Problem:** Forgetting that empty sequences have type `Sequence<never>`.

```typescript
function process(items: Array<string>) {
  const seq = items.length > 0 ? Sequence.from(items) : Sequence.empty();
  //    ^? Sequence<string> | Sequence<never>

  // Type error: Sequence<never> doesn't have string methods
  // seq.map((s) => s.toUpperCase());
}
```

**Solution:** Use explicit type parameters:

```typescript
function process(items: Array<string>) {
  const seq =
    items.length > 0 ? Sequence.from(items) : Sequence.empty<string>();
  //    ^? Sequence<string>

  // Now works correctly
  seq.map((s) => s.toUpperCase());
}
```

### Pitfall 10: Over-using Sequences

**Problem:** Using sequences for small, fixed-size collections adds overhead without benefit.

```typescript
// Overkill for small array
const coords = Sequence.from([x, y, z]).map(Math.round).toArray();

// Better: Use array methods directly
const coords = [x, y, z].map(Math.round);
```

**Solution:** Use arrays for small (<100 elements) collections. Reserve sequences for:

- Large or infinite data
- Expensive transformations you want to cache
- Pipelines with early termination
- Functional composition patterns

### Debugging Tips

**Use type guards to understand sequence state:**

```typescript
import { Sequence } from "@siteimprove/alfa-sequence";

if (Sequence.isNil(seq)) {
  console.log("Sequence is empty");
} else if (Sequence.isCons(seq)) {
  console.log("First element:", seq.first().getUnsafe());
}
```

**Force evaluation to inspect intermediate results:**

```typescript
const step1 = source.map(transform1);
console.log("After transform1:", step1.toArray());

const step2 = step1.filter(predicate);
console.log("After filter:", step2.toArray());
```

**Check if transformations are being cached:**

```typescript
let computations = 0;
const seq = Sequence.from([1, 2, 3]).map((n) => {
  computations++;
  return n * 2;
});

seq.toArray();
console.log("First pass:", computations); // 3

computations = 0;
seq.toArray();
console.log("Second pass:", computations); // 0 (cached!)
```

## API Reference

This section provides a categorized overview of the Sequence API. For complete type signatures and detailed documentation, see the [generated API documentation](https://alfa.siteimprove.com/api/alfa-sequence/).

### Creation

| Method                      | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `Sequence.of(head, tail?)`  | Create sequence from head and optional lazy tail |
| `Sequence.empty()`          | Create empty sequence (Nil)                      |
| `Sequence.from(iterable)`   | Create sequence from array or iterable           |
| `Sequence.fromArray(array)` | Create sequence from array (optimized)           |

### Type Guards

| Method                  | Description                           |
| ----------------------- | ------------------------------------- |
| `Sequence.isSequence()` | Check if value is a Sequence          |
| `Sequence.isCons()`     | Check if sequence is non-empty (Cons) |
| `Sequence.isNil()`      | Check if sequence is empty (Nil)      |
| `isEmpty()`             | Instance method: check if empty       |

### Transformation

| Method               | Description                        | Lazy? |
| -------------------- | ---------------------------------- | ----- |
| `map(mapper)`        | Transform each element             | ✅    |
| `flatMap(mapper)`    | Transform and flatten sequences    | ✅    |
| `flatten()`          | Flatten nested sequences           | ✅    |
| `filter(predicate)`  | Keep elements matching predicate   | ✅    |
| `reject(predicate)`  | Remove elements matching predicate | ✅    |
| `collect(mapper)`    | Map to Option and keep Some values | ✅    |
| `distinct()`         | Remove duplicate elements          | ✅    |
| `reverse()`          | Reverse sequence order             | ❌    |
| `sort()`             | Sort comparable elements           | ❌    |
| `sortWith(comparer)` | Sort with custom comparer          | ❌    |

### Access

| Method       | Description                    | Forces Sequence? |
| ------------ | ------------------------------ | ---------------- |
| `first()`    | Get first element as Option    | Head only        |
| `last()`     | Get last element as Option     | Entire sequence  |
| `get(index)` | Get element at index as Option | Up to index      |
| `has(index)` | Check if index exists          | Up to index      |
| `rest()`     | Get all elements except first  | Tail only        |

### Slicing

| Method                 | Description                            | Lazy?   |
| ---------------------- | -------------------------------------- | ------- |
| `take(count)`          | Take first N elements                  | ✅      |
| `takeLast(count)`      | Take last N elements                   | ❌      |
| `takeWhile(predicate)` | Take while predicate holds             | ✅      |
| `takeUntil(predicate)` | Take until predicate matches           | ✅      |
| `skip(count)`          | Skip first N elements                  | ✅      |
| `skipLast(count)`      | Skip last N elements                   | ❌      |
| `skipWhile(predicate)` | Skip while predicate holds             | ✅      |
| `skipUntil(predicate)` | Skip until predicate matches           | ✅      |
| `slice(start, end?)`   | Get slice from start to end            | ✅      |
| `preceding(predicate)` | Elements before first match (reversed) | Partial |

### Aggregation

| Method              | Description                       | Short-circuits? |
| ------------------- | --------------------------------- | --------------- |
| `reduce(fn, init)`  | Reduce to single value            | No              |
| `reduceWhile(...)`  | Reduce while predicate holds      | Yes             |
| `reduceUntil(...)`  | Reduce until predicate matches    | Yes             |
| `forEach(callback)` | Execute callback for each element | No              |
| `size`              | Count elements (property)         | No              |
| `count(predicate)`  | Count matching elements           | No              |
| `countUntil(...)`   | Count until condition met         | Yes             |

### Search

| Method                 | Description                        | Short-circuits? |
| ---------------------- | ---------------------------------- | --------------- |
| `find(predicate)`      | Find first matching element        | Yes             |
| `some(predicate)`      | Check if any element matches       | Yes             |
| `every(predicate)`     | Check if all elements match        | Yes             |
| `none(predicate)`      | Check if no elements match         | Yes             |
| `includes(value)`      | Check if value exists in sequence  | Yes             |
| `collectFirst(mapper)` | Find first Some result from mapper | Yes             |

### Combination

| Method                 | Description                         | Lazy? |
| ---------------------- | ----------------------------------- | ----- |
| `concat(iterable)`     | Append another iterable to end      | ✅    |
| `zip(iterable)`        | Pair elements with another iterable | ✅    |
| `prepend(value)`       | Add element to front                | ✅    |
| `append(value)`        | Add element to end                  | ✅    |
| `insert(index, value)` | Insert element at index             | ✅    |
| `set(index, value)`    | Replace element at index            | ✅    |

### Set Operations

| Method                | Description                             | Lazy? |
| --------------------- | --------------------------------------- | ----- |
| `intersect(iterable)` | Keep elements present in both sequences | ✅    |
| `subtract(iterable)`  | Remove elements present in other        | ✅    |

### Trimming

| Method                    | Description                             | Lazy?   |
| ------------------------- | --------------------------------------- | ------- |
| `trim(predicate)`         | Remove matching elements from both ends | Partial |
| `trimLeading(predicate)`  | Remove matching elements from start     | ✅      |
| `trimTrailing(predicate)` | Remove matching elements from end       | ❌      |

### Grouping

| Method             | Description                    | Forces Sequence? |
| ------------------ | ------------------------------ | ---------------- |
| `groupBy(grouper)` | Group elements by key into Map | Entire sequence  |

### Utility

| Method            | Description                       | Forces Sequence? |
| ----------------- | --------------------------------- | ---------------- |
| `apply(mappers)`  | Apply sequence of functions       | Yes              |
| `tee(callback)`   | Execute callback, return sequence | No               |
| `join(separator)` | Join to string                    | Entire sequence  |

### Comparison

| Method                    | Description                      | Forces Sequence? |
| ------------------------- | -------------------------------- | ---------------- |
| `equals(other)`           | Check structural equality        | Yes              |
| `compare(iterable)`       | Compare with comparable elements | Yes              |
| `compareWith(iter, comp)` | Compare with custom comparer     | Yes              |

### Conversion

| Method       | Description                      | Forces Sequence? |
| ------------ | -------------------------------- | ---------------- |
| `toArray()`  | Convert to array                 | Entire sequence  |
| `toJSON()`   | Convert to JSON representation   | Entire sequence  |
| `toString()` | Convert to string representation | Entire sequence  |

### Notes on Lazy Operations

- **Lazy (✅)**: Operation creates new lazy wrappers; no computation until forced
- **Not Lazy (❌)**: Operation forces computation immediately
- **Partial**: Operation forces only what's needed (e.g., up to a condition)

### Working with Predicates and Refinements

Many operations accept `Predicate<T>` or `Refinement<T, U>` for type-safe filtering:

```typescript
import { Predicate } from "@siteimprove/alfa-predicate";

const { and, or, not } = Predicate;

const isEven = (n: number) => n % 2 === 0;
const isPositive = (n: number) => n > 0;

// Combine predicates
seq.filter(and(isEven, isPositive));
seq.filter(or(isEven, isPositive));
seq.filter(not(isEven));

// Type refinement
function isString(value: unknown): value is string {
  return typeof value === "string";
}

const mixed: Sequence<string | number> = /* ... */;
const strings: Sequence<string> = mixed.filter(isString);
```

### Integration with Other Alfa Types

Sequence integrates seamlessly with other Alfa abstractions:

```typescript
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Ok, Err } from "@siteimprove/alfa-result";

// Option
seq.first(); // Option<T>
seq.find(predicate); // Option<T>
seq.collectFirst(mapper); // Option<U>

// Combining with Option
seq.collect((n) => n > 0 ? Option.of(n) : None);

// Note: Sequence doesn't directly integrate with Result,
// but you can map/collect over Result values:
const results: Sequence<Result<T, E>> = /* ... */;
const successes = results.collect((r) => r.isOk() ? Option.of(r.get()) : None);
```

## Related Packages

- [`@siteimprove/alfa-lazy`](https://alfa.siteimprove.com/api/alfa-lazy/) - Lazy evaluation wrapper
- [`@siteimprove/alfa-option`](https://alfa.siteimprove.com/api/alfa-option/) - Optional values
- [`@siteimprove/alfa-predicate`](https://alfa.siteimprove.com/api/alfa-predicate/) - Type-safe predicates
- [`@siteimprove/alfa-iterable`](https://alfa.siteimprove.com/api/alfa-iterable/) - Iterable utilities
- [`@siteimprove/alfa-array`](https://alfa.siteimprove.com/api/alfa-array/) - Array utilities

## License

MIT License - see LICENSE file for details.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines on contributing to Alfa packages.
