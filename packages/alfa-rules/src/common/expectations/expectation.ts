import { Question } from "@siteimprove/alfa-act";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Trilean } from "@siteimprove/alfa-trilean";
import { Result } from "@siteimprove/alfa-result";

type MyResult = Result<string, string> | Option<Result<string, string>>;
type MyQuestion<QUESTION, ANSWER, SUBJECT> = Question<
  QUESTION,
  ANSWER,
  SUBJECT,
  Option<Result<string, string>>
>;

function forceOption<T, QUESTION, ANSWER, SUBJECT>(
  x: T | Option<T> | MyQuestion<QUESTION, ANSWER, SUBJECT>
): Option<T> | MyQuestion<QUESTION, ANSWER, SUBJECT> {
  return x instanceof Question ? x : Option.isOption(x) ? x : Some.of(x);
}

/*
  Some expectations are mixing results and questions, hence we need to mix the types.
  But we need precise typing in order to avoid piling Question<*,*,*, Question<…>> when building result.
  Hence, a full case study is needed. And made a bit more painful because of the optional argument.
 */
// When both ifTrue and IfFalse are result, case study on ifUndefined.
export function expectation(
  test: Trilean,
  ifTrue: MyResult,
  ifFalse: MyResult,
  ifUndefined?: MyResult
): Option<Result<string, string>>;
export function expectation<Q, A, S>(
  test: Trilean,
  ifTrue: MyResult,
  ifFalse: MyResult,
  ifUndefined: MyQuestion<Q, A, S>
): Option<Result<string, string>> | MyQuestion<Q, A, S>;

// When {ifTrue, ifFalse} are {Result, Question}, we can get both, no matter what ifUndefined is.
export function expectation<Q, A, S>(
  test: Trilean,
  ifTrue: MyResult,
  ifFalse: MyQuestion<Q, A, S>,
  ifUndefined?: MyResult | MyQuestion<Q, A, S>
): Option<Result<string, string>> | MyQuestion<Q, A, S>;
export function expectation<Q, A, S>(
  test: Trilean,
  ifTrue: MyQuestion<Q, A, S>,
  ifFalse: MyResult,
  ifUndefined?: MyResult | MyQuestion<Q, A, S>
): Option<Result<string, string>> | MyQuestion<Q, A, S>;

// When both ifTrue and ifFalse are Question, case study on ifUndefined.
export function expectation<Q, A, S>(
  test: Trilean,
  ifTrue: MyQuestion<Q, A, S>,
  ifFalse: MyQuestion<Q, A, S>,
  ifUndefined: MyResult
): Option<Result<string, string>> | MyQuestion<Q, A, S>;
export function expectation<Q, A, S>(
  test: Trilean,
  ifTrue: MyQuestion<Q, A, S>,
  ifFalse: MyQuestion<Q, A, S>,
  ifUndefined?: MyQuestion<Q, A, S>
): MyQuestion<Q, A, S>;

export function expectation<QUESTION, ANSWER, SUBJECT>(
  test: Trilean,
  ifTrue: MyResult | MyQuestion<QUESTION, ANSWER, SUBJECT>,
  ifFalse: MyResult | MyQuestion<QUESTION, ANSWER, SUBJECT>,
  ifUndefined: MyResult | MyQuestion<QUESTION, ANSWER, SUBJECT> = None
): Option<Result<string, string>> | MyQuestion<QUESTION, ANSWER, SUBJECT> {
  switch (test) {
    case true:
      return forceOption(ifTrue);
    case false:
      return forceOption(ifFalse);
    case undefined:
      return forceOption(ifUndefined);
  }
}
