# API

Alfa exposes a large API surface split across many different packages. As an API consumer, you typically only interact with a handful of these packages and, as shown in the [Usage][] section of the [README][], a complete example of running an audit using Alfa requires only 3 package imports.

Most of the packages provided by Alfa are small, foundational packages that provide shared interfaces, common algorithms and data structures, and more. In keeping with the second [goal of Alfa][goals], it ships with its own implementations of much common functionality, ensuring a cohesive experience for API consumers and developers alike.

The following present an introduction on some overarching principles in Alfa' API, as well as some of the common interfaces commonly used in the code base.

You can get an overview of the packages architecture (grouped thematically) with the [dependency graph](./dependency-graph.png). To take a deep device into the API, start your journey at the [package overview][].

> :warning: Many packages still lack accompanying explanations for their public API. The generated API documentation should therefore be considered a work in progress.

## Design

The APIs of Alfa are all based on the same approach of merging the best aspect of functional programming with the best aspect object-oriented programming: Immutable objects that carry around their methods. This is a pattern you'll find throughout Alfa and which may at first feel somewhat foreign. From foundational data structures to the machinery responsible for carrying out accessibility audits, methods never modify objects, but instead return new objects with the modifications applied. This is a rather drastic shift from how JavaScript APIs are usually designed and can take some getting used to.

To get a quick taste of the benefits of this approach, consider the following code:

```ts
const map = new Map<string, number>();

map.set("foo", 42);
// This call modifies `map`

doSomethingWithMap(map);

map.get("foo");
// ?
```

The call to `doSomethingWithMap()` is free to modify `map` as it wishes and so even though we used a `const` binding for `map`, we're not guaranteed that `map.get("foo")` will return `42`. We were also free to modify `map` with the side effecting call `map.set("foo", 42)`.

Let's take a look at the equivalent code using the `@siteimprove/alfa-map` package:

```ts
import { Map } from "@siteimprove/alfa-map";

const map = Map.empty<string, number>().set("foo", 42);

map.set("foo", 24);
// This call has no effect on `map`

doSomethingWithMap(map);

map.get("foo");
// 42
```

As the `Map<K, V>` class from `@siteimprove/alfa-map` is immutable, we can be sure that `doSomethingWithMap()` has no way of modifying `map`. The call to `map.get("foo")` is therefore guaranteed to always return `42`. This quality is called [referential transparency][] and means that we can substitute any expression with its value without changing the behaviour of the code.

As a result of this quality, it becomes easier to reason about the behaviour of a given piece of code as all modifications of state are made explicit. If, for example, `doSomethingWithMap()` _was_ supposed to modify `map`, we'd have to explicitly change the binding:

```ts
import { Map } from "@siteimprove/alfa-map";

let map = Map.empty<string, number>().set("foo", 42);

map = doSomethingWithMap(map);

map.get("foo");
// ?
```

## Foundations

In this section, we'll take a look at some of the foundational APIs that are used throughout Alfa.

### Equivalence

When dealing with the concept of equivalence in JavaScript, we typically distinguish between two kinds of equivalence:

- **Value equivalence**. For primitive types, such as numbers, booleans, and strings, we can use the `==` and `===` operators to test for value equivalence:

  ```ts
  42 === 42;
  // true

  true === true;
  /// true

  const a = "foo";
  const b = "foo";

  a === b;
  // true

  "foo" === "bar";
  // false
  ```

  That is, two values or bindings are equal if their values are the same.

  Keep in mind that the `==` operator attempts to convert between different types of values and so might produce unexpected results:

  ```ts
  "42" == 42;
  // true
  ```

  For this reason, you'll never see this operator used in Alfa.

- **Referential equivalence**. For object types, which encompass all the non-primitive types, the `==` and `===` operators instead test for referential equivalence:

  ```ts
  [1, 2, 3] === [1, 2, 3];
  // false

  const a = { foo: 42 };
  const b = { foo: 42 };

  a === b;
  // false

  a === a;
  // true
  ```

  That is, two values or bindings are equal if they _reference_ the same object.

The problem with the `==` and `===` operators is that they force us to use value equivalence for primitive types and referential equivalence for object types.

Often times, what we really want is to use _structural equivalence_ for object types, that is consider two values or bindings as equal if the _structure_ of their values are also equal. For arrays, this means testing if the arrays have the same length and if their elements are pairwise equal. For objects, this means testing if the objects have the same set of properties and if the properties are pairwise equal.

For this reason, the `@siteimprove/alfa-equatable` package defines the `Equatable` interface with a single method, `#equals()`, that determines if the implementing class is equal to a given value:

```ts
import { Equatable } from "@siteimprove/alfa-equatable";

class Foo implements Equatable {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  equals(value: Foo): boolean;

  equals(value: unknown): value is this;

  equals(value: unknown): boolean {
    return value instanceof Foo && value.value === this.value;
  }
}

const a = new Foo(42);
const b = new Foo(42);

a === b;
// false

a.equals(b);
// true
```

Additionally, the companion namespace of the `Equatable` interface defines the `Equatable.equals()` function which can be used for testing unknown values for equivalence, making use of `Equatable#equals()` if either of the values being tested implement `Equatable`:

```ts
Equatable.equals("foo", "foo");
// true

Equatable.equals(a, b);
// true
```

### Comparisons

Similar to the `==` and `===` operators used for testing equivalence, JavaScript also provides operators for comparing values: `<`, `>`, `<=`, and `>=`. These operators perform an [abstract relational comparison][], which we won't go into details with. Suffice to say, it's... complicated. It mostly works as you'd expect when dealing with numbers, booleans, and strings, but gives surprising results for object types:

```ts
{} < {};
// false

{} <= {};
// true
```

To work with objects that can be compared, the `@siteimprove/alfa-comparable` package defines a `Comparable` interface with a single method, `#compare()`, that determines if the implementing class is less than, equal to, or greater than a given value:

```ts
import { Comparable, Comparison } from "@siteimprove/alfa-comparable";

class Foo implements Comparable<Foo> {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  compare(value: Foo): Comparison {
    if (this.value < value.value) {
      return Comparison.Less;
    }

    if (this.value > value.value) {
      return Comparison.Greater;
    }

    return Comparison.Equal;
  }
}

const a = new Foo(42);
const b = new Foo(21);

a.compare(b);
// Comparison.Greater

b.compare(a);
// Comparison.Less

a.compare(a);
// Comparison.Equal
```

Additionally, the companion namespace of the `Comparable` interface defines the `Comparable.compare()` function which can be used comparing strings, numbers, booleans, and values implementing `Comparable`:

```ts
Comparable.compare("a", "b");
// Comparison.Less

Comparable.compare(2, 1);
// Comparison.Greater

Comparable.compare(true, true);
// Comparison.Equal

Comparable.compare(a, b);
// Comparison.Greater
```

### Hashing

In the design section, we briefly touched on a conceptual difference between the builtin `Map<K, V>` class and the `Map<K, V>` class from the `@siteimprove/alfa-map` package; the former is mutable while the latter is immutable. Another, and perhaps more important, difference is how the two deal with equivalence.

Recall from a couple of sections back when we talked about equivalence: For object types, the `==` and `===` operators force us to use referential equivalence. The builtin `Map<K, V>` is no different and so we cannot use the _structure_ of an object as the key in a `Map<K, V>`:

```ts
const map = new Map<{ foo: number }, number>();

map.set({ foo: 42 }, 42);

map.get({ foo: 42 });
// undefined
```

Instead, we can only use the _reference_ to an object as the key in a `Map<K, V>`:

```ts
const foo = { foo: 42 };

map.set(foo, 42);

map.get(foo);
// 42
```

To get around this limitation, the `Map<K, V>` class from the `@siteimprove/alfa-map` package uses the `Equatable.equals()` function for testing equivalence of keys.

This only solves half the puzzle, however. As `Map<K, V>` relies on hashing for efficiently storing and retrieving values, it also needs a way of computing hash values for object types. What's more, these hash values need to hold the property that if `Equatable.equals(a, b)` is `true` then the hash value of `a` must equal that of `b`.

To this end, the `@siteimprove/alfa-hash` package defines a `Hashable` interface with a single method, `#hash()`, that determines how to hash the implementing class:

```ts
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";

class Foo implements Equatable, Hashable {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  equals(value: Foo): boolean;

  equals(value: unknown): value is this;

  equals(value: unknown): boolean {
    return value instanceof Foo && value.value === this.value;
  }

  hash(hash: Hash): void {
    hash.writeNumber(this.value);
  }
}
```

Our example also provides an implementation of `Equatable` which is required for the aforementioned property to hold. With these two implementations in place, we can do the following:

```ts
import { Map } from "@siteimprove/alfa-map";

const map = Map.empty<Foo, number>().set(new Foo(42), 42);

map.get(new Foo(42));
// 42
```

It's worth pointing out that if we _don't_ implement `Equatable` and `Hashable` for our type, `Map<K, V>` will use referential equivalence and a unique hash value will be assigned to every object, ensuring that the aforementioned property holds.

The observant reader may have noticed that the `Hash` class deviates from the API design outlined previously. The reason for this is rather simple and boils down to performance. Hashes are meant to encode large amounts of data in constant space, and having to allocate a new object for every little piece of data we want to add serves counter to that purpose.

### Serialization

JSON serialization is another common piece of functionality and is supported via the builtin [`toJSON()`][tojson] method. This method is called by `JSON.stringify()` when converting values to JSON:

```ts
class Foo {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  toJSON(): number {
    return this.value;
  }
}

const foo = new Foo(42);

foo.toJSON();
// 42

JSON.stringify(foo);
// "42"
```

While this works, it's possible for the `toJSON()` method to return values that _cannot_ be represented as JSON, such as an anonymous function:

```ts
class Foo {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  toJSON() {
    return () => this.value;
  }
}

const foo = new Foo(42);

foo.toJSON();
// () => this.value

JSON.stringify(foo);
// undefined
```

To ensure that all JSON serialization methods are valid, the `@siteimprove/alfa-json` package defines the `Serializable` interface with a single method, `#toJSON()`, that requires the implementing class to return valid JSON as defined by the `JSON` type of the same package:

```ts
import { Serializable } from "@siteimprove/alfa-json";

class Foo implements Serializable<Foo.JSON> {
  readonly value: number;

  constructor(value: number) {
    this.value = value;
  }

  toJSON(): Foo.JSON {
    return this.value;
  }
}

namespace Foo {
  export type JSON = number;
}

const foo = new Foo(42);

foo.toJSON();
// 42

JSON.stringify(foo);
// "42"
```

Another feature of the `Serializable` interface is that it allows us to infer the type of the resulting JSON serialization of container types, such as `Map<K, V>`:

```ts
const map = Map.empty<Foo, string>().set(new Foo(42), "42");

map.toJSON();
// Array<[number, string]>
```

That is, `#toJSON()` knows that `Foo` will serialize to `number` and that `string` will serialize as-is.

In Alfa, JSON serialization is often used as a means of asserting the structure of an object as it can be difficult to spot differences in expected and actual structure if deeply comparing the internals of the object.

### Collections

We've already seen quite a bit about the `@siteimprove/alfa-map` package and its `Map<K, V>` class. The `Map<K, V>` class is, however, just one out of several collections used throughout Alfa. In this section, we'll provide an overview of the most common collections and their intended use. As with any data structures, they each have their own strengths and weaknesses to be mindful of when choosing a collection for a given task.

#### `Collection.Indexed<T>`

##### `List<T>`

The `List<T>` class provides an implementation of a [persistent][] [vector trie][] for storing a list of values of type `T`. It provides effectively constant time `#append()`, `#set()`, and `#get()`.

For values, `List<T>` uses an implementation of `Equatable`, when available. That is, no modifications are made when updating the value at a given index with the current value `a` and the new value `b` if `a.equals(b)`.

**Do use when:**

- You're primarily appending new values to, updating existing values in, or repeatedly removing the last value from the list.

**Don't use when:**

- You're often inserting values either at the begging of or in the middle of the list, especially if it's large.

- You're dealing with performance critical code, which might be better served by the builtin `Array<T>` class.

- You're only interested in a few values of the list, which might be better served by the `Sequence<T>` class.

##### `Sequence<T>`

The `Sequence<T>` class provides an implementation of a [persistent][] [lazy][] list for storing a possibly infinite sequence of values of type `T`. By virtue of being lazy, it provides mostly constant time operations as no computations are actually performed until the corresponding values are requested.

**Do use when:**

- You're performing sequence operations on an arbitrary and possible infinite `Iterable<T>`. This includes generator functions, which can be beneficial to wrap in a `Sequence<T>`.

- You're working with a sequence of values that don't all need to be determined at once. Using `Sequence<T>`, such sequences can be constructed in constant time and only the needed values yielded as necessary.

- You're performing sequence operations where eager evaluation would lead to suboptimal performance, such as `#map()` followed by `#find()`. With eager evaluation, `#map()` will be applied to _every_ value of the sequence, even those _after_ the value returned by `#find()`. With lazy evaluation, `#map()` will only be applied _up to and including_ the value returned by `#find()`.

**Don't use when:**

- You're often modifying the sequence which for each modification, with the exception of prepends, is done in time proportional to the number of values yielded by the sequence.

##### `Slice<T>`

The `Slice<T>` class provides an implementation of a [persistent][] [copy-on-write][] array for storing values of type `T`. It provides constant time `#get()`, `#has()`, and `#slice()`.

**Do use when:**

- You're working with increasingly smaller portions of a backing array, such as when parsing a list of tokens.

**Don't use when:**

- You're working with performance critical code, which may be better served by manually tracking a pointer into the backing array.

#### `Collection.Keyed<K, V>`

##### `Map<K, V>`

The `Map<K, V>` class provides an implementation of a [persistent][] [hash trie][] for associating unique keys of type `K` with values of type `V`. It provides effectively constant time `#set()`, `#has()`, `#get()`, and `#delete()`.

For keys, `Map<K, V>` uses implementations of `Equatable` and `Hashable`, when available. That is, two keys `a` and `b` are considered the same key if `a.hash().equals(b.hash())` and `a.equals(b)`.

For values, `Map<K, V>` uses an implementation of `Equatable`, when available. That is, no modifications are made when updating the value of a key with the current value `a` and the new value `b` if `a.equals(b)`.

**Do use when:**

- Your keys have custom equivalence and hashing constraints.

**Don't use when:**

- You're working with performance critical code, which may be better served by the builtin `Map<K, V>` or `WeakMap<K, V>` class.

#### `Collection.Unkeyed<T>`

##### `Set<T>`

The `Set<T>` class provides an implementation of a [persistent][] [hash trie][] for storing a set of unique values of type `K`. It provides effectively constant time `#add()`, `#has()`, and `#delete()`.

For values, `Set<T>` uses implementations of `Equatable` and `Hashable`, when available. That is, two values `a` and `b` are considered the same value if `a.hash().equals(b.hash())` and `a.equals(b)`.

**Do use when:**

- Your values have custom equivalence and hashing constraints.

**Don't use when:**

- You're working with performance critical code, which may be better served by the builtin `Set<T>` or `WeakSet<T>` class.

[abstract relational comparison]: https://tc39.es/ecma262/#sec-abstract-relational-comparison
[copy-on-write]: https://en.wikipedia.org/wiki/Copy-on-write
[goals]: ../README.md#goals
[hash trie]: https://idea.popcount.org/2012-07-25-introduction-to-hamt/
[lazy]: https://en.wikipedia.org/wiki/Lazy_evaluation
[package overview]: api/index.md#packages
[persistent]: https://en.wikipedia.org/wiki/Persistent_data_structure
[readme]: ../README.md
[referential transparency]: https://en.wikipedia.org/wiki/Referential_transparency
[tojson]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
[usage]: ../README.md#usage
[vector trie]: https://hypirion.com/musings/understanding-persistent-vector-pt-1
