import { Diagnostic, Interview } from "@siteimprove/alfa-act";
import { None, Option } from "@siteimprove/alfa-option";
import { Result } from "@siteimprove/alfa-result";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Trilean } from "@siteimprove/alfa-trilean";

type Expectation<Q, S, C> = Interview<
  Q,
  S,
  C,
  Option.Maybe<Result<Diagnostic>>
>;

export function expectation<Q, S, C>(
  test: Trilean,
  ifTrue: Thunk<Option.Maybe<Result<Diagnostic>>>,
  ifFalse: Thunk<Option.Maybe<Result<Diagnostic>>>,
  ifUnknown?: Thunk<Option.Maybe<Result<Diagnostic>>>
): Option<Result<Diagnostic>>;

export function expectation<Q, S, C>(
  test: Trilean,
  ifTrue: Thunk<Expectation<Q, S, C>>,
  ifFalse: Thunk<Expectation<Q, S, C>>,
  ifUnknown?: Thunk<Expectation<Q, S, C>>
): Interview<Q, S, C, Option<Result<Diagnostic>>>;

export function expectation<Q, S, C>(
  test: Trilean,
  ifTrue: Thunk<Expectation<Q, S, C>>,
  ifFalse: Thunk<Expectation<Q, S, C>>,
  ifUnknown: Thunk<Expectation<Q, S, C>> = Thunk.of(None)
): Expectation<Q, S, C> {
  switch (test) {
    case true:
      return ifTrue();

    case false:
      return ifFalse();

    default:
      return ifUnknown();
  }
}
