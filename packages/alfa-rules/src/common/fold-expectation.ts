import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-trilean";
import { Result } from "@siteimprove/alfa-result";

function forceOption<T>(x: T | Option<T>): Option<T> {
  return Option.isOption(x) ? x : Some.of(x);
}

export function foldExpectation<T>(
  predicate: Predicate<T>,
  target: T,
  ifTrue: Result<string, string> | Option<Result<string, string>>,
  ifFalse: Result<string, string> | Option<Result<string, string>>,
  ifUndefined: Result<string, string> | Option<Result<string, string>> = None
): Option<Result<string, string>> {
  return Predicate.fold(
    predicate,
    target,
    () => forceOption(ifTrue),
    () => forceOption(ifFalse),
    () => forceOption(ifUndefined)
  );
}
