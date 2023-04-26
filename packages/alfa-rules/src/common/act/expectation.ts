import type { Diagnostic, Interview, Question } from "@siteimprove/alfa-act";
import { Maybe, None } from "@siteimprove/alfa-option";
import type { Result } from "@siteimprove/alfa-result";
import { Thunk } from "@siteimprove/alfa-thunk";
import type { Trilean } from "@siteimprove/alfa-trilean";

// In practice, Q is always Question.Metadata.
// However, replacing it here causes TypeScript to fail and pretend
// there is a potentially infinite recursion in types.
//
// It's not clear exactly why that confuses TS… We may want to try later
// if newer versions (>4.6.2) handle this better. In the meantime, we
// keep the extra type parameter here.
//
// This unfortunately forces us to add a Question.Metadata parameter all over
// the place in callers that need to specify the depth of an interview :-(

type Expectation<
  Q extends Question.Metadata,
  S,
  C,
  D extends number = Interview.MaxDepth
> = Interview<Q, S, C, Maybe<Result<Diagnostic>>, D>;

export function expectation(
  test: Trilean,
  ifTrue: Thunk<Maybe<Result<Diagnostic>>>,
  ifFalse: Thunk<Maybe<Result<Diagnostic>>>,
  ifUnknown?: Thunk<Maybe<Result<Diagnostic>>>
): Maybe<Result<Diagnostic>>;

export function expectation<
  Q extends Question.Metadata,
  S,
  C,
  D extends number
>(
  test: Trilean,
  ifTrue: Thunk<Expectation<Q, S, C, D>>,
  ifFalse: Thunk<Expectation<Q, S, C, D>>,
  ifUnknown?: Thunk<Expectation<Q, S, C, D>>
): Expectation<Q, S, C, D>;

export function expectation<
  Q extends Question.Metadata,
  S,
  C,
  D extends number = Interview.MaxDepth
>(
  test: Trilean,
  ifTrue: Thunk<Expectation<Q, S, C, D>>,
  ifFalse: Thunk<Expectation<Q, S, C, D>>,
  ifUnknown: Thunk<Expectation<Q, S, C, D>> = Thunk.of(None)
): Expectation<Q, S, C, D> {
  switch (test) {
    case true:
      return ifTrue();

    case false:
      return ifFalse();

    default:
      return ifUnknown();
  }
}
