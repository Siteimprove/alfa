import { Array } from "@siteimprove/alfa-array";
import type { Hashable } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
import type { Mapper } from "@siteimprove/alfa-mapper";
import { Maybe } from "@siteimprove/alfa-option";
import type { Performance } from "@siteimprove/alfa-performance";
import type { Record } from "@siteimprove/alfa-record";
import type { Result } from "@siteimprove/alfa-result";
import type { Sequence } from "@siteimprove/alfa-sequence";

import type { Cache } from "../cache.ts";
import type { Diagnostic, Oracle } from "../expectation/index.ts";
import { Finding, Interview, type Question } from "../expectation/index.ts";
import { Outcome } from "../outcome.ts";

import { Event } from "./event.ts";
import { RulePerformance } from "./rule-performance.ts";
import type { Rule } from "./index.ts";

const { reduce } = Iterable;

/**
 * One target ready to be resolved into an Outcome: the target value, its
 * (already-wrapped) expectation interviews, and whether the oracle was used to
 * establish this target.
 *
 * @internal
 */
export interface Resolvable<
  T extends Hashable,
  Q extends Question.Metadata,
  S,
> {
  target: T;
  expectations: Record<{
    [key: string]: Interview<Q, S, T, Maybe<Result<Diagnostic>>>;
  }>;
  oracleUsed: boolean;
}

/**
 * What a rule's target-collecting step hands back: the ordered targets to
 * resolve, the global oracle-used flag (used for the Inapplicable mode when
 * there are no targets), and an optional wrapper used to time the resolve stage
 * (Atomic's "expectation" phase; omitted by Composite).
 *
 * @internal
 */
export interface Collected<T extends Hashable, Q extends Question.Metadata, S> {
  items: Sequence<Resolvable<T, Q, S>>;
  oracleUsed: boolean;
  measureResolve?: <O>(run: () => Promise<O>) => Promise<O>;
}

/**
 * The shared body of a rule's evaluation procedure: memoize, mark the total
 * start/end, then either short-circuit to Inapplicable (no targets) or resolve
 * every collected target. The differing target-collecting step is supplied by
 * `collect`, which is handed a rule-scoped performance instance.
 *
 * @internal
 */
export function evaluate<I, T extends Hashable, Q extends Question.Metadata, S>(
  rule: Rule<I, T, Q, S>,
  // A rule asking no questions, never calls its oracle, so it can be anything
  oracle: {} extends Q ? any : Oracle<I, T, Q, S>,
  outcomes: Cache,
  performance: Performance<Event<I, T, Q, S>> | undefined,
  collect: (
    rulePerformance: RulePerformance<I, T, Q, S> | undefined,
  ) => Promise<Collected<T, Q, S>>,
): Promise<Iterable<Outcome<I, T, Q, S>>> {
  return outcomes.get(rule, async () => {
    const startRule = performance?.mark(Event.start(rule)).start;

    const rulePerformance = RulePerformance.wrap(rule, performance);

    const { items, oracleUsed, measureResolve } =
      await collect(rulePerformance);

    let result: Iterable<Outcome<I, T, Q, S>>;

    if (items.isEmpty()) {
      result = [Outcome.Inapplicable.of(rule, Outcome.getMode(oracleUsed))];
    } else {
      const run = () =>
        Promise.all(
          Array.from(items).map((item) =>
            resolve(
              item.target,
              item.expectations,
              rule,
              oracle,
              item.oracleUsed,
            ),
          ),
        );

      result = await (measureResolve ? measureResolve(run) : run());
    }

    performance?.measure(Event.end(rule), startRule);

    return result;
  });
}

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
function resolve<I, T extends Hashable, Q extends Question.Metadata, S>(
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
