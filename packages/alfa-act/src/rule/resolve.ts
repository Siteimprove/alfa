import { Array } from "@siteimprove/alfa-array";
import type { Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { Maybe } from "@siteimprove/alfa-option";
import type { Record } from "@siteimprove/alfa-record";
import type { Result } from "@siteimprove/alfa-result";

import type { Rule } from "./index.ts";
import type { Diagnostic, Oracle } from "../expectation/index.ts";
import { Finding, Interview, type Question } from "../expectation/index.ts";
import { Outcome } from "../outcome.ts";

const { reduce } = Iterable;

/**
 * Resolves the expectations of a rule.
 *
 * The rule has given us a bunch of unresolved expectations (i.e. interviews).
 * We need to conduct each interview, then group them into a single Outcome.
 * If the finding of each and every interview is Conclusive, then we can also
 * have a Conclusive global finding, which is turned into either a Passed or
 * Failed outcome (delegated to Outcome.from); as soon as we have an interview
 * with an Inconclusive finding, we stop processing the list and return it as
 * a CantTell outcome.
 *
 * @internal
 */
export function resolve<I, T extends Hashable, Q extends Question.Metadata, S>(
  target: T,
  expectations: Record<{
    [key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic>>>;
  }>,
  rule: Rule<I, T, Q, S>,
  // A rule asking no questions, never calls its oracle, so it can be anything
  oracle: {} extends Q ? any : Oracle<I, T, Q, S>,
  oracleUsedInApplicability: boolean,
): Promise<Outcome.Applicable<I, T, Q, S>> {
  return (
    // First, conduct all interviews and get the findings.
    Promise.all(Array.from(expectations).map(conductInterview(rule, oracle)))
      // Next, we process the findings, turning a list of findings into a finding
      // of a list.
      .then(processFindings(Maybe.toOption, oracleUsedInApplicability))
      // Lastly, we turn the finding into an Outcome. If the finding is
      // Conclusive, this will be a Passed/Failed outcome, otherwise we can
      // create the CantTell one now.
      .then(Outcome.fromFinding(rule, target))
  );
}

/**
 * Conducts the interview for an expectation: (un)wrap the expectation `id`
 * before and after conducting the actual interview.
 */
function conductInterview<
  I,
  T extends Hashable,
  Q extends Question.Metadata,
  S,
>(
  rule: Rule<I, T, Q, S>,
  oracle: {} extends Q ? any : Oracle<I, T, Q, S>,
): ([id, interview]: [
  string,
  Interview<Q, S, T, Maybe<Result<Diagnostic>>>,
]) => Promise<[string, Finding<Maybe<Result<Diagnostic>>>]> {
  return ([id, interview]) =>
    Interview.conduct(interview, rule, oracle).then(
      (finding): [string, Finding<Maybe<Result<Diagnostic>>>] => [id, finding],
    );
}

/**
 * Reducer for going from a list of findings to a finding of a list.
 *
 * If the accumulator list is already inconclusive, we stop immediately.
 * Otherwise, we add the current finding to it, matching its conclusiveness.
 **/
function processFindings<T, U>(
  mapper: Mapper<T, U>,
  oracleUsedInApplicability: boolean,
): (findings: Iterable<[string, Finding<T>]>) => Finding<List<[string, U]>> {
  return (findings) =>
    reduce(
      findings,
      (acc, [id, finding]) =>
        acc.either(
          // The accumulator is a conclusive finding, keep going.
          ([accumulator, oracleUsedAccumulator]) =>
            finding.either(
              // The current result is conclusive, accumulate it.
              ([result, oracleUsed]) =>
                Finding.conclusive(
                  accumulator.append([id, mapper(result)]),
                  oracleUsedAccumulator || oracleUsed,
                ),
              // The current result is inconclusive, abort.
              ([diagnostic, oracleUsed]) =>
                Finding.inconclusive(
                  diagnostic,
                  oracleUsedAccumulator || oracleUsed,
                ),
            ),
          // The accumulator is already inconclusive, skip.
          // Note that we only keep the mode of the first Expectation that cannot tell,
          // which is likely OK.
          () => acc,
        ),
      Finding.conclusive(List.empty(), oracleUsedInApplicability),
    );
}
