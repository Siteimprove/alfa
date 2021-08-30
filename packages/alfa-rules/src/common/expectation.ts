import { Diagnostic } from "@siteimprove/alfa-act-base";
import { Interview, Question } from "@siteimprove/alfa-act";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Result } from "@siteimprove/alfa-result";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Trilean } from "@siteimprove/alfa-trilean";

type Path<Q, S, C> = Interview<Q, S, C, Option.Maybe<Result<Diagnostic>>>;

function toExpectation<Q, S, C>(
  path: Path<Q, S, C>
): Interview<Q, S, C, Option<Result<Diagnostic>>> {
  if (path instanceof Question) {
    return path.map(toExpectation);
  }

  if (Option.isOption(path)) {
    return path;
  }

  return Some.of(path);
}

export function expectation<Q, S, C>(
  test: Trilean,
  ifTrue: Thunk<Path<Q, S, C>>,
  ifFalse: Thunk<Path<Q, S, C>>,
  ifUnknown: Thunk<Path<Q, S, C>> = Thunk.of(None)
): Interview<Q, S, C, Option<Result<Diagnostic>>> {
  switch (test) {
    case true:
      return toExpectation(ifTrue());

    case false:
      return toExpectation(ifFalse());

    default:
      return toExpectation(ifUnknown());
  }
}
