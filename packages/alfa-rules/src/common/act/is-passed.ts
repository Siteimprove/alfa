import { Outcome } from "@siteimprove/alfa-act";
import { Hashable } from "@siteimprove/alfa-hash";
import { Trilean } from "@siteimprove/alfa-trilean";

export function isPassed<I, T extends Hashable, Q>(
  outcome: Outcome.Applicable<I, T, Q>
): Trilean {
  if (Outcome.isPassed(outcome)) {
    return true;
  }

  if (Outcome.isFailed(outcome)) {
    return false;
  }

  return undefined;
}
