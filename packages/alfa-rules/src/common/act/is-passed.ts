import { Outcome, type Question } from "@siteimprove/alfa-act";
import type { Hashable } from "@siteimprove/alfa-hash";
import type { Trilean } from "@siteimprove/alfa-trilean";

export function isPassed<I, T extends Hashable, Q extends Question.Metadata>(
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
