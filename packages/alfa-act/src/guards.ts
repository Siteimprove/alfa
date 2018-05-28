import { Target, Result, Question } from "./types";

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
