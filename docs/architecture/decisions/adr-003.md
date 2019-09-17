# ADR 3: Use TypeScript as implementation language

## Context

Having decided on [ADR 2](adr-002.md), we foresee that the Alfa code base will be both significantly larger and more complex than the code base of our proprietary engine. This is due to the fact that we will have to implement a great deal of APIs that we have previously relied on the browser implementations of. Coupled with the fact that the most common type of bug we have encountered in the past has been stray `undefined` or `null` values and APIs receiving incorrect parameters, plain JavaScript, even if covered by tests, is simply not an option moving forward. We will either need tooling that can sanity check our JavaScript or move to a language with a proper type system that can enforce API contracts.

However, given that browsers are still part of the equation, Alfa must be able to also run in a browser. This way, we ensure that we can implement tools such as our Chrome extension based on Alfa.

## Decision

We will use [TypeScript](https://github.com/Microsoft/TypeScript) for implementing all of Alfa. Being a superset of JavaScript, TypeScript has a low learning curve for people already familiar with JavaScript while providing a solid type system. We will enforce API contracts through generation of [declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) which will dictate the API surface that consumers can access. To the extent possible, we will keep a strict TypeScript configuration in order to catch as many issues as possible at compile time. In particular, this entails strict `undefined` and `null` checking in order to get rid of a previously common type of bug.

## Status

Accepted.

## Consequences

In addition to providing us with type safety of our code, TypeScript will also enable a better and more productive workflow through editor and IDE integrations. We hopefully also will not see any bugs related to stray `undefined` or `null` values nor will we see bugs related to incorrect API usage. The hope is that this will enable us to scale the code base of Alfa far beyond the size of our current code base, while still keeping the code easy to reason about.

On the flip side, we do introduce additional complexity by using a more advanced language than plain JavaScript. We are however confident that by increasing the complexity of the implementation language by a bit, we can reduce the overall complexity of the code base by a lot.
