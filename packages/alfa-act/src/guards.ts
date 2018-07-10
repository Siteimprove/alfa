import { Aspect, Question, Result, Target } from "./types";

export function isResult<A extends Aspect, T extends Target>(
  input: Result<A, T> | Question<T>
): input is Result<A, T> {
  return "outcome" in input;
}

export function isQuestion<A extends Aspect, T extends Target>(
  input: Result<A, T> | Question<T>
): input is Question<T> {
  return "question" in input;
}
