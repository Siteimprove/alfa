import {
  Aspect,
  Atomic,
  Composite,
  Question,
  Result,
  Rule,
  Target
} from "./types";

export function isResult<A extends Aspect, T extends Target>(
  input: Result<A, T> | Question<A, T>
): input is Result<A, T> {
  return "outcome" in input;
}

export function isQuestion<A extends Aspect, T extends Target>(
  input: Result<A, T> | Question<A, T>
): input is Question<A, T> {
  return !isResult(input);
}

export function isAtomic<A extends Aspect, T extends Target>(
  rule: Rule<A, T>
): rule is Atomic.Rule<A, T> {
  return "composes" in rule === false;
}

export function isComposite<A extends Aspect, T extends Target>(
  rule: Rule<A, T>
): rule is Composite.Rule<A, T> {
  return "composes" in rule;
}
