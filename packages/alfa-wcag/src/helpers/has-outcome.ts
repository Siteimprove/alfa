import { Aspect, Outcome, Result, Target } from "@siteimprove/alfa-act";

export function hasOutcome<A extends Aspect, T extends Target>(
  results: ReadonlyArray<Pick<Result<A, T>, "outcome">>,
  outcome: Outcome
): boolean {
  return results.find(result => result.outcome === outcome) !== undefined;
}
