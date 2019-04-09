import { trimLeft } from "./trim-left";
import { trimRight } from "./trim-right";

export function trim(
  input: string,
  predicate: (code: number) => boolean
): string {
  return trimLeft(trimRight(input, predicate), predicate);
}
