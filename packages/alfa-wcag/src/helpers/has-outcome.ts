import { Aspect, Outcome, Result, Target } from "@siteimprove/alfa-act";

export function hasOutcome<A extends Aspect, T extends Target>(
  results: Iterable<Pick<Result<A, T>, "outcome">>,
  outcome: Outcome
): boolean {
  for (const result of results) {
    if (result.outcome === outcome) {
      return true;
    }
  }

  return false;
}
