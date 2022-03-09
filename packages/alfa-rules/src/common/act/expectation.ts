import { Diagnostic, Interview } from "@siteimprove/alfa-act";
import { None, Option } from "@siteimprove/alfa-option";
import { Result } from "@siteimprove/alfa-result";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Trilean } from "@siteimprove/alfa-trilean";

// In practice, Q is always Question.Metadata.
// However, replacing it here causes TypeScript to fail and pretend
// there is a potentially infinite recursion in types.
//
// It's not clear exactly why that confuses TS… We may want to try later
// if newer versions (>4.5.5) handles this better. In the meantime, we
// keep the extra type parameter here.
//
// This unfortunately forces us to add a Question.Metadata parameter all over
// the place in callers that need to specify the depth of an interview :-(

type Expectation<Q, S, C, D extends number = 3> = Interview<
  Q,
  S,
  C,
  Option.Maybe<Result<Diagnostic>>,
  D
>;

export function expectation(
  test: Trilean,
  ifTrue: Thunk<Option.Maybe<Result<Diagnostic>>>,
  ifFalse: Thunk<Option.Maybe<Result<Diagnostic>>>,
  ifUnknown?: Thunk<Option.Maybe<Result<Diagnostic>>>
): Option.Maybe<Result<Diagnostic>>;

export function expectation<Q, S, C, D extends number>(
  test: Trilean,
  ifTrue: Thunk<Expectation<Q, S, C, D>>,
  ifFalse: Thunk<Expectation<Q, S, C, D>>,
  ifUnknown?: Thunk<Expectation<Q, S, C, D>>
): Expectation<Q, S, C, D>;

export function expectation<Q, S, C, D extends number = 3>(
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
