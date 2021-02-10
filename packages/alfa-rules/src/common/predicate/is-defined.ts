import { Refinement } from "@siteimprove/alfa-refinement";

const { not, equals } = Refinement;

export function isDefined<T>(): Refinement<T | undefined, T> {
  return not(equals<T | undefined, undefined>(undefined));
}
