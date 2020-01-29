import { None, Option, Some } from "@siteimprove/alfa-option";
import { Trilean} from "@siteimprove/alfa-trilean";
import { Result } from "@siteimprove/alfa-result";

function forceOption<T>(x: T | Option<T>): Option<T> {
  return Option.isOption(x) ? x : Some.of(x);
}

export function expectation(
  test: Trilean,
  ifTrue: Result<string, string> | Option<Result<string, string>>,
  ifFalse: Result<string, string> | Option<Result<string, string>>,
  ifUndefined: Result<string, string> | Option<Result<string, string>> = None
): Option<Result<string, string>> {
  switch (test) {
    case true: return forceOption(ifTrue);
    case false: return forceOption(ifFalse);
    case undefined: return forceOption(ifUndefined);
  }
}
