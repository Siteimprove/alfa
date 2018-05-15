import { Node } from "@siteimprove/alfa-dom";
import { Result, Question, Aspect } from "./types";

export function isResult<T extends Node, A extends Aspect>(
  input: Result<T, A> | Question<T>
): input is Result<T, A> {
  return "outcome" in input;
}

export function isQuestion<T extends Node>(
  input: Result<T, any> | Question<T>
): input is Question<T> {
  return "question" in input;
}
