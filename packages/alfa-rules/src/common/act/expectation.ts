import { Diagnostic, Interview } from "@siteimprove/alfa-act";
import { None, Option } from "@siteimprove/alfa-option";
import { Result } from "@siteimprove/alfa-result";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Trilean } from "@siteimprove/alfa-trilean";

type Expectation<Q, S, C, D extends number = 3> = Interview<
  Q,
  S,
  C,
  Option.Maybe<Result<Diagnostic>>,
  D
>;

export function expectation<Q, S, C>(
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
