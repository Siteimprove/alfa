import { BrowserSpecific } from "@siteimprove/alfa-compatibility";
import { keys, Mutable, values } from "@siteimprove/alfa-util";
import { isAtomic } from "./guards";
import { sortRules } from "./sort-rules";
import {
  Answer,
  AnswerType,
  Aspect,
  AspectsFor,
  Atomic,
  Composite,
  Evaluations,
  Outcome,
  Question,
  QuestionType,
  Result,
  Rule,
  Target
} from "./types";

// The `audit()` function is special in that it requires use of conditional
// types in order to correctly infer the union of aspect and target types for a
// list of rules. In order to do so, we unfortunately have to make use of the
// `any` type, which trips up TSLint as we've made the `any` type forbidden and
// this for good reason.
//
// tslint:disable:no-any

const { isArray } = Array;
const { assign } = Object;

const { map, unwrap, reduce } = BrowserSpecific;

type AspectsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? A
  : never;

type TargetsOf<R extends Rule<any, any>> = R extends Rule<infer A, infer T>
  ? T
  : never;

type ResultSet<A extends Aspect, T extends Target> = Array<
  BrowserSpecific<Result<A, T>>
>;

type ResultMap<A extends Aspect, T extends Target> = Map<
  Rule<A, T>,
  BrowserSpecific<ResultSet<A, T>>
>;

export function audit<
  R extends Rule<any, any>,
  A extends AspectsOf<R> = AspectsOf<R>,
  T extends TargetsOf<R> = TargetsOf<R>
>(
  aspects: AspectsFor<A>,
  rules: ReadonlyArray<R> | { readonly [P in R["id"]]: R },
  answers: ReadonlyArray<Answer<QuestionType, A, T>> = []
): {
  results: Array<Result<A, T>>;
  questions: Array<Question<QuestionType, A, T>>;
} {
  rules = isArray(rules) ? rules : values(rules);

  const questions: Array<Question<QuestionType, A, T>> = [];

  function question<Q extends QuestionType>(
    type: Q,
    id: string,
    rule: Atomic.Rule<A, T>,
    aspect: A[keyof A],
    target: T
  ): AnswerType[Q] | null {
    const answer = answers.find(
      answer =>
        answer.type === type &&
        answer.id === id &&
        answer.rule.id === rule.id &&
        answer.aspect === aspect &&
        answer.target === target
    );

    if (answer !== undefined) {
      return answer.answer;
    }

    questions.push({ type, id, rule, aspect, target });

    return null;
  }

  const evaluations: ResultMap<A, T> = new Map();

  for (const rule of sortRules(rules)) {
    const evaluation = isAtomic(rule)
      ? auditAtomic<A, T>(aspects, rule, (type, id, aspect, target) =>
          question(type, id, rule, aspect, target)
        )
      : auditComposite<A, T>(aspects, rule, evaluations);

    if (evaluation === null) {
      continue;
    }

    evaluations.set(rule, evaluation);
  }

  const results: Array<Result<A, T>> = [];

  for (const [rule, wrapped] of evaluations) {
    const unwrapped = unwrap(map(wrapped, wrapped => wrapped.map(unwrap)));

    for (const { value: evaluations, browsers } of unwrapped) {
      if (evaluations.length === 0) {
        results.push(<Result<A, T>>assign(
          {
            rule,
            outcome: Outcome.Inapplicable
          },
          {
            browsers
          }
        ));
      } else {
        for (const unwrapped of evaluations) {
          for (const { value: evaluation, browsers } of unwrapped) {
            results.push(assign(evaluation, { browsers }));
          }
        }
      }
    }
  }

  return { results, questions };
}

function auditAtomic<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  rule: Atomic.Rule<A, T>,
  question: <Q extends QuestionType>(
    type: Q,
    id: string,
    aspect: A,
    target: T
  ) => AnswerType[Q] | null
): BrowserSpecific<ResultSet<A, T>> | null {
  let aspect: A;
  let targets: ReadonlyArray<T> | BrowserSpecific<ReadonlyArray<T>> = [];

  const applicability: Atomic.Applicability<A, T> = (
    _aspect,
    applicability
  ) => {
    const _targets = applicability((type, id, target) =>
      question(type, id, _aspect, target)
    );

    if (_targets !== null) {
      aspect = _aspect;
      targets = _targets;
    }
  };

  let results: BrowserSpecific<ResultSet<A, T>> | null = null;

  const expectations: Atomic.Expectations<A, T> = expectations => {
    results = map(targets, targets => {
      return targets.map(target => {
        const evaluator = getExpectationEvaluater(aspect, target, rule);

        return map(
          expectations(aspect, target, (type, id) =>
            question(type, id, aspect, target)
          ),
          evaluations => {
            return evaluator(evaluations);
          }
        );
      });
    });
  };

  rule.definition(applicability, expectations, aspects);

  return results;
}

function auditComposite<A extends Aspect, T extends Target>(
  aspects: AspectsFor<A>,
  rule: Composite.Rule<A, T>,
  evaluations: ResultMap<A, T>
): BrowserSpecific<ResultSet<A, T>> | null {
  const applicability: Array<BrowserSpecific<ResultSet<A, T>>> = [];

  for (const composite of rule.composes) {
    const evaluation = evaluations.get(composite);

    if (evaluation !== undefined) {
      applicability.push(evaluation);
    }
  }

  const groups = map(
    reduce(
      applicability,
      (results, evaluations) =>
        map(evaluations, evaluations => [...results, ...evaluations]),
      [] as ResultSet<A, T>
    ),
    targets =>
      reduce(
        targets,
        (groups, result) => {
          if (result.outcome === Outcome.Inapplicable) {
            return groups;
          }

          let group = groups.find(group => group[1] === result.target);

          if (group === undefined) {
            group = [result.aspect, result.target, []];
            groups = [...groups, group];
          }

          group[2].push(result);

          return groups;
        },
        [] as Array<[A, T, Array<Result<A, T>>]>
      )
  );

  let results: BrowserSpecific<ResultSet<A, T>> | null = null;

  const expectations: Composite.Expectations<A, T> = expectations => {
    results = map(groups, groups => {
      return groups.map(group => {
        const [aspect, target, results] = group;

        const evaluator = getExpectationEvaluater(aspect, target, rule);

        return map(expectations(results), evaluations => {
          return evaluator(evaluations);
        });
      });
    });
  };

  rule.definition(expectations);

  return results;
}

type Applicable = Outcome.Passed | Outcome.Failed | Outcome.CantTell;

function getExpectationEvaluater<A extends Aspect, T extends Target>(
  aspect: A,
  target: T,
  rule: Rule<A, T>
): (evaluations: Evaluations) => Result<A, T, Applicable> {
  const { locales = [] } = rule;

  const locale = locales.find(locale => locale.id === "en");

  return evaluations => {
    const outcome = keys(evaluations).reduce<Applicable>((outcome, id) => {
      const { holds } = evaluations[id];
      return holds === null
        ? Outcome.CantTell
        : holds
        ? outcome
        : Outcome.Failed;
    }, Outcome.Passed);

    const expectations: Mutable<Result<A, T, Applicable>["expectations"]> = {};

    for (const id of keys(evaluations)) {
      const { holds, data } = evaluations[id];

      let message: string | null = null;

      if (locale !== undefined) {
        const messages = locale.expectations[id];

        if (messages !== undefined) {
          const outcome =
            holds === null
              ? Outcome.CantTell
              : holds
              ? Outcome.Passed
              : Outcome.Failed;

          const callback = messages[outcome];

          if (callback !== undefined) {
            message = callback(data === undefined ? {} : data);
          }
        }
      }

      if (message === null) {
        const status =
          holds === null
            ? "was not evaluated"
            : holds
            ? "holds"
            : "does not hold";

        message = `Expectation ${id} ${status}`;
      }

      expectations[id] = {
        holds,
        message,
        data: data === undefined ? null : data
      };
    }

    const result: Result<A, T, any> = {
      rule,
      outcome,
      aspect,
      target,
      expectations
    };

    return result;
  };
}
