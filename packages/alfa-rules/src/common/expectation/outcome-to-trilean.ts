import { Outcome } from "@siteimprove/alfa-act";
import { Trilean } from "@siteimprove/alfa-trilean";

export function outcomeToTrilean<I, T, Q>(
  outcome: Outcome.Applicable<I, T, Q>
): Trilean {
  if (Outcome.isPassed(outcome)) return true;
  if (Outcome.isFailed(outcome)) return false;
  return undefined;
}
