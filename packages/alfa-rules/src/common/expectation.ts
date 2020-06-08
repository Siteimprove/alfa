import { Diagnostic, Interview, Question, Rule } from "@siteimprove/alfa-act";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Result } from "@siteimprove/alfa-result";
import { Thunk } from "@siteimprove/alfa-thunk";
import { Trilean } from "@siteimprove/alfa-trilean";

type Path<Q, S> = Interview<Q, S, Option.Maybe<Result<Diagnostic>>>;

function toExpectation<Q, S>(
  path: Path<Q, S>
): Interview<Q, S, Option<Result<Diagnostic>>> {
  if (path instanceof Question) {
    return path.map(toExpectation);
  }

  if (Option.isOption(path)) {
    return path;
  }

  return Some.of(path);
}

export function expectation<Q, S>(
  test: Trilean,
  ifTrue: Thunk<Path<Q, S>>,
  ifFalse: Thunk<Path<Q, S>>,
  ifUnknown: Thunk<Path<Q, S>> = Thunk.of(None)
): Interview<Q, S, Option<Result<Diagnostic>>> {
  switch (test) {
    case true:
      return toExpectation(ifTrue());

    case false:
      return toExpectation(ifFalse());

    default:
      return toExpectation(ifUnknown());
  }
}
