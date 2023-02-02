# ADR 10: Use `Future<T>` to model possibly asynchronous computations 

## Context

Alfa provides semi-automated tests for which user input is required. This can be handled either synchronously or asynchronously.

In a synchronous pattern, an audit runs and gathers unanswered questions; then the caller needs to run a new audit with these answers provided, which may ask new questions, … This pattern is well suited for the batch audits of pages that run at regular intervals.

In an asynchronous pattern, the audit may pause at each question, waiting for the user to provide an answer (the caller provides the actual UI for interaction). This pattern is well suited for individual audits run in a command line or a browser extension.

ECMAScript provides a `Promise<T>` type for modelling asynchronous computations. However, it is by design near impossible to resolve promises synchronously and all the computation has to become asynchronous.

Additionally, the error handling of `Promise` is done via exceptions which, as outline in [ADR 9](./adr-009.md) create problem with code flow and typing that we'd rather avoid.

## Decision

We will introduce a `Future<T>` type to model computation that _may be_ asynchronous, but may also resolve synchronously.

The handling of errors during these computation will be done by wrapping the output in a `Result` type, i.e. using a `Future<Result<T, E>>` type as per [ADR 9](./adr-009.md).

## Status

Accepted.

## Consequences

The choice of how to provide answers to questions is left to the caller, whether it is synchronous or asynchronous. Notably, audit can default to a synchronous "no answer provided" mode to totally remove the burden from callers. From the audit point of view, an `oracle` function is provided by the caller and called every time a `CantTell` result is reached.

Together with the `Result` type, this provides a type-safe way of handling errors inside possibly asynchronous computations.

The `Future` syntax differs a bit from the traditional `Promise` syntax, which may increase the entry barrier for new team members.

See more discussion about this choice in "[The great refactoring](https://github.com/Siteimprove/alfa/pull/165)" pull request.
