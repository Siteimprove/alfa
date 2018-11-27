import {
  Aspect,
  Atomic,
  Composite,
  Question,
  Result,
  Rule,
  Target
} from "./types";

export function isResult<T extends Target>(
  input: Result<T> | Question<T>
): input is Result<T> {
  return "outcome" in input;
}

export function isQuestion<T extends Target>(
  input: Result<T> | Question<T>
): input is Question<T> {
  return "question" in input;
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
